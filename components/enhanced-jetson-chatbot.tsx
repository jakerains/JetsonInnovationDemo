'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Background } from './Background'
import { SendButton } from './SendButton' // Ensure SendButton is properly exported

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
}

const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean
  return function(...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

const AnimatedText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('')
  const [shouldAnimate, setShouldAnimate] = useState(true)

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayedText(text)
      return
    }

    let i = 0
    const intervalId = setInterval(() => {
      setDisplayedText(text.slice(0, i))
      i += 3 // Increase characters per tick
      if (i > text.length) {
        clearInterval(intervalId)
        setDisplayedText(text)
      }
    }, 30) // Slower interval but more characters per tick

    // Stop animation after 3 seconds to prevent performance issues
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId)
      setDisplayedText(text)
      setShouldAnimate(false)
    }, 3000)

    return () => {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [text, shouldAnimate])

  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p>{children}</p>,
        code: ({ children }) => <code className="bg-gray-800 rounded px-1">{children}</code>,
      }}
    >
      {displayedText}
    </ReactMarkdown>
  )
}

const ChatArea = ({ messages, fontSize }: { messages: Message[], fontSize: number }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800 bg-opacity-50">
      <AnimatePresence>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-3 ${
                message.sender === 'user' 
                  ? 'bg-gradient-to-r from-[#76B900] to-[#8ed100] text-black' 
                  : 'bg-gradient-to-r from-gray-700 to-gray-600 text-white'
              } shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02]`}
              style={{ fontSize: `${fontSize}px` }}
            >
              <AnimatedText text={message.text} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  )
}

export function EnhancedJetsonChatbotComponent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [fontSize, setFontSize] = useState(16); // Default font size
  const inputRef = useRef<HTMLInputElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus()
    }
  }, [isLoading])

  const handleSend = useCallback(async () => {
    if (input.trim() && !isLoading) {
      setIsLoading(true);
      const userMessage: Message = { id: Date.now(), text: input.trim(), sender: 'user' };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput('');

      // Create a temporary message for streaming
      const botMessage: Message = {
        id: Date.now() + 1,
        text: '',
        sender: 'bot'
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            messages: updatedMessages.map(m => ({ 
              role: m.sender,
              text: m.text 
            }))
          }),
        });

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        let accumulatedText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Parse the streaming response
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                accumulatedText += data.content;
                
                setMessages(prevMessages => {
                  const newMessages = [...prevMessages];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.sender === 'bot') {
                    lastMessage.text = accumulatedText;
                  }
                  return newMessages;
                });
              } catch (e) {
                console.error('Error parsing JSON:', e);
              }
            }
          }
        }

      } catch (error) {
        console.error('Detailed Error:', error);
        setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.sender === 'bot') {
            lastMessage.text = "Sorry, I couldn't process your request.";
          }
          return newMessages;
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [input, messages, isLoading]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend()
    }
  }, [handleSend, isLoading])

  const handleClearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const adjustFontSize = (increment: number) => {
    setFontSize(prevSize => Math.max(12, Math.min(24, prevSize + increment)));
  };

  const handleMouseMove = useCallback(
    throttle((e: React.MouseEvent<HTMLDivElement>) => {
      const container = inputContainerRef.current
      const glowEffect = container?.querySelector('.mouse-glow-effect') as HTMLElement
      if (container && glowEffect) {
        const rect = container.getBoundingClientRect()
        const x = e.clientX - rect.left
        glowEffect.style.left = `${x - 25}px`
      }
    }, 50), // Throttle to 50ms
    []
  )

  return (
    <div className="relative flex flex-col h-screen bg-gradient-radial from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Background />
      </div>
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl h-[80vh] glassmorphism rounded-xl shadow-lg overflow-hidden relative flex flex-col">
          {/* Header */}
          <div className="relative py-4 px-6 bg-gradient-to-b from-[#9aff00] via-[#8ed100] to-[#76B900] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 16.61V7.39L12 2.5L3 7.39V16.61L12 21.5L21 16.61Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 21.5V12.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 12.5L3 7.39" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 12.5L21 7.39" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-3xl font-bold text-white">JETSON</span>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 text-lg text-white hidden md:block">
              AI at the Edge!
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 mr-2">
                <button onClick={() => adjustFontSize(1)} className="text-white hover:text-gray-200 transition-colors duration-200 text-xl w-6 h-6 flex items-center justify-center">+</button>
                <button onClick={() => adjustFontSize(-1)} className="text-white hover:text-gray-200 transition-colors duration-200 text-xl w-6 h-6 flex items-center justify-center">-</button>
              </div>
              <button 
                onClick={handleClearChat} 
                className="bg-white text-[#76B900] px-3 py-1 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors duration-200"
                style={{ fontSize: '14px' }} // Fixed font size
              >
                Clear Chat
              </button>
            </div>
          </div>

          <ChatArea messages={messages} fontSize={fontSize} />
          <div className="p-4 bg-gray-800 bg-opacity-75">
            <div className="flex items-center space-x-2">
              <div 
                className="relative flex-1" 
                ref={inputContainerRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => {
                  const glowEffect = inputContainerRef.current?.querySelector('.mouse-glow-effect') as HTMLElement;
                  if (glowEffect) glowEffect.style.opacity = '1';
                }}
                onMouseLeave={() => {
                  const glowEffect = inputContainerRef.current?.querySelector('.mouse-glow-effect') as HTMLElement;
                  if (glowEffect) glowEffect.style.opacity = '0';
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="w-full bg-gray-700 text-white rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#76B900] transition-shadow duration-200 disabled:opacity-50 aurora-glow"
                  style={{ fontSize: '16px' }}
                />
                <div className="aurora-glow-effect"></div>
                <div className="mouse-glow-effect"></div>
              </div>
              <SendButton onClick={handleSend} disabled={isLoading || !input.trim()} />
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%);
        }
        @keyframes aurora-glow {
          0% {
            box-shadow: 0 0 5px #76B900, 0 0 10px #76B900, 0 0 15px #76B900, 0 0 20px #76B900;
          }
          50% {
            box-shadow: 0 0 10px #76B900, 0 0 20px #76B900, 0 0 30px #76B900, 0 0 40px #76B900;
          }
          100% {
            box-shadow: 0 0 5px #76B900, 0 0 10px #76B900, 0 0 15px #76B900, 0 0 20px #76B900;
          }
        }

        .aurora-glow {
          position: relative;
          z-index: 1;
        }

        .aurora-glow:focus, .aurora-glow:hover {
          animation: aurora-glow 4s ease-in-out infinite; // Slowed down to 4s
        }

        .aurora-glow-effect {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 9999px;
          background: radial-gradient(circle at 50% 50%, rgba(118, 185, 0, 0.3), transparent 70%);
          filter: blur(8px);
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
          z-index: 0;
        }

        .aurora-glow:focus + .aurora-glow-effect,
        .aurora-glow:hover + .aurora-glow-effect {
          opacity: 1;
        }

        @keyframes glow {
          0% { filter: drop-shadow(0 0 2px rgba(118, 185, 0, 0.7)); }
          50% { filter: drop-shadow(0 0 10px rgba(118, 185, 0, 0.5)); }
          100% { filter: drop-shadow(0 0 2px rgba(118, 185, 0, 0.7)); }
        }
        .cube-glow {
          animation: glow 2s infinite;
        }

        .mouse-glow-effect {
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 50px;
          height: 10px;
          background: radial-gradient(circle, rgba(118, 185, 0, 0.5), transparent 70%);
          filter: blur(5px);
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
          pointer-events: none;
        }

        .aurora-glow:hover + .aurora-glow-effect + .mouse-glow-effect {
          opacity: 1;
        }

        .aurora-glow:focus {
          box-shadow: 0 0 10px #76B900;
          transition: box-shadow 0.3s ease-in-out;
        }

        .mouse-glow-effect {
          display: none;
        }

        @media (min-width: 768px) {
          .aurora-glow:hover {
            box-shadow: 0 0 10px #76B900;
            transition: box-shadow 0.3s ease-in-out;
          }
        }
      `}</style>
    </div>
  )
}

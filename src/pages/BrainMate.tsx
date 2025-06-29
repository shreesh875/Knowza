import React, { useState, useRef, useEffect } from 'react'
import { useDaily, DailyVideo, useParticipantIds, useLocalSessionId, useAudioTrack, useVideoTrack, DailyAudio } from '@daily-co/daily-react'
import { Mic, MicOff, PhoneOff, MessageCircle, Send, Camera, CameraOff, AlertCircle, Video, Bot, BookOpen, Brain, Lightbulb, Target, TrendingUp, HelpCircle, Settings } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { createConversation } from '../api/createConversation'
import { endConversation } from '../api/endConversation'
import { useDeepSeekChat } from '../hooks/useDeepSeekChat'
import type { IConversation, ConversationMessage } from '../types/tavus'

// WebGL Shader Programs for Chroma Key Effect
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = vec2(a_texCoord.x, 1.0 - a_texCoord.y);
  }
`

const fragmentShaderSource = `
  precision mediump float;
  uniform sampler2D u_image;
  varying vec2 v_texCoord;
  uniform vec3 u_keyColor;
  uniform float u_threshold;
  void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    float diff = length(color.rgb - u_keyColor);
    gl_FragColor = diff < u_threshold ? vec4(0.0) : color;
  }
`

const initShader = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return shader
}

const initWebGL = (gl: WebGLRenderingContext) => {
  const program = gl.createProgram()!
  gl.attachShader(program, initShader(gl, gl.VERTEX_SHADER, vertexShaderSource))
  gl.attachShader(program, initShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource))
  gl.linkProgram(program)
  gl.useProgram(program)

  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

  const texCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW)

  const positionLocation = gl.getAttribLocation(program, 'a_position')
  const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord')

  gl.enableVertexAttribArray(positionLocation)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  gl.enableVertexAttribArray(texCoordLocation)
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

  return {
    program,
    texture,
    imageLocation: gl.getUniformLocation(program, 'u_image'),
    keyColorLocation: gl.getUniformLocation(program, 'u_keyColor'),
    thresholdLocation: gl.getUniformLocation(program, 'u_threshold'),
  }
}

const VideoComponent: React.FC<{ id: string }> = ({ id }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const glRef = useRef<WebGLRenderingContext | null>(null)

  const webGLContext = React.useMemo(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true })
      if (gl) {
        glRef.current = gl
        return initWebGL(gl)
      }
    }
    return null
  }, [canvasRef.current])

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      const checkVideoReady = () => {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          setIsVideoReady(true)
          video.removeEventListener('canplay', checkVideoReady)
        }
      }
      video.addEventListener('canplay', checkVideoReady)
      return () => video.removeEventListener('canplay', checkVideoReady)
    }
  }, [])

  useEffect(() => {
    if (!isVideoReady || !webGLContext) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const gl = glRef.current
    if (!video || !canvas || !gl) return

    const { program, texture, imageLocation, keyColorLocation, thresholdLocation } = webGLContext

    let animationFrameId: number
    let lastFrameTime = 0
    const targetFPS = 30
    const frameInterval = 1000 / targetFPS

    const applyChromaKey = (currentTime: number) => {
      if (currentTime - lastFrameTime < frameInterval) {
        animationFrameId = requestAnimationFrame(applyChromaKey)
        return
      }

      lastFrameTime = currentTime

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        gl.viewport(0, 0, canvas.width, canvas.height)

        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)

        gl.uniform1i(imageLocation, 0)
        gl.uniform3f(keyColorLocation, 3 / 255, 255 / 255, 156 / 255)
        gl.uniform1f(thresholdLocation, 0.3)

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      }

      animationFrameId = requestAnimationFrame(applyChromaKey)
    }

    applyChromaKey(0)

    return () => {
      cancelAnimationFrame(animationFrameId)
      if (gl && program && texture) {
        gl.deleteProgram(program)
        gl.deleteTexture(texture)
      }
    }
  }, [isVideoReady, webGLContext])

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl overflow-hidden border border-purple-400/30 backdrop-blur-sm">
      <DailyVideo
        sessionId={id}
        type="video"
        ref={videoRef}
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  )
}

interface DraggableVideoPreviewProps {
  localParticipantId: string | null
  isCameraEnabled: boolean
}

const DraggableVideoPreview: React.FC<DraggableVideoPreviewProps> = ({ localParticipantId, isCameraEnabled }) => {
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const videoRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!videoRef.current) return
    
    const rect = videoRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setIsDragging(true)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !videoRef.current) return
    
    const container = videoRef.current.parentElement
    if (!container) return
    
    const containerRect = container.getBoundingClientRect()
    const videoRect = videoRef.current.getBoundingClientRect()
    
    const newX = e.clientX - containerRect.left - dragOffset.x
    const newY = e.clientY - containerRect.top - dragOffset.y
    
    // Constrain to container bounds
    const maxX = containerRect.width - videoRect.width
    const maxY = containerRect.height - videoRect.height
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  if (!localParticipantId) return null

  return (
    <div
      ref={videoRef}
      className={`absolute w-48 h-36 bg-neutral-900 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg z-10 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      } transition-shadow hover:shadow-xl backdrop-blur-sm`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <DailyVideo
        sessionId={localParticipantId}
        type="video"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {!isCameraEnabled && (
        <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
          <CameraOff className="w-8 h-8 text-neutral-400" />
        </div>
      )}
      
      {/* Drag indicator */}
      <div className="absolute top-2 left-2 w-2 h-2 bg-white/50 rounded-full"></div>
      <div className="absolute top-2 left-5 w-2 h-2 bg-white/50 rounded-full"></div>
      <div className="absolute top-2 left-8 w-2 h-2 bg-white/50 rounded-full"></div>
    </div>
  )
}

interface MediaPermissionsProps {
  onPermissionsGranted: () => void
  onPermissionsDenied: (error: string) => void
}

const MediaPermissions: React.FC<MediaPermissionsProps> = ({ onPermissionsGranted, onPermissionsDenied }) => {
  const [requesting, setRequesting] = useState(false)

  const requestPermissions = async () => {
    setRequesting(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      })
      
      stream.getTracks().forEach(track => track.stop())
      onPermissionsGranted()
    } catch (error: any) {
      let errorMessage = 'Failed to access camera and microphone'
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera and microphone access denied. Please allow access and try again.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found on this device.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera or microphone is already in use by another application.'
      }
      
      onPermissionsDenied(errorMessage)
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div className="text-center p-12">
      <div className="mb-8">
        <div className="w-32 h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-400/30 backdrop-blur-sm">
          <Bot className="w-16 h-16 text-purple-400" />
        </div>
        <h3 className="text-3xl font-bold text-white mb-4">
          Meet Your Learning Companion
        </h3>
        <p className="text-white/70 text-lg max-w-lg mx-auto mb-6">
          Eden is ready to help you understand concepts from your feed, answer questions, and guide your learning journey through interactive video conversations.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-white/60 mb-8">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span>Context-Aware</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Feed Integration</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            <span>Personalized</span>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={requestPermissions} 
        disabled={requesting}
        size="lg"
        className="mb-6 px-8 py-4 text-lg"
      >
        {requesting ? (
          <>
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
            Requesting Access...
          </>
        ) : (
          <>
            <Camera className="w-5 h-5 mr-3" />
            Start Video Session
          </>
        )}
      </Button>
      
      <div className="text-sm text-white/60 max-w-sm mx-auto">
        Your privacy is protected. We only use your camera and microphone for video calls and never store or share your data.
      </div>
    </div>
  )
}

const VideoCall: React.FC<{ onLeave: () => void }> = ({ onLeave }) => {
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' })
  const localParticipantId = useLocalSessionId()
  const localAudio = useAudioTrack(localParticipantId)
  const localVideo = useVideoTrack(localParticipantId)
  const daily = useDaily()
  
  const isMicEnabled = !localAudio.isOff
  const isCameraEnabled = !localVideo.isOff

  const toggleMicrophone = () => {
    daily?.setLocalAudio(!isMicEnabled)
  }

  const toggleCamera = () => {
    daily?.setLocalVideo(!isCameraEnabled)
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        {remoteParticipantIds.length > 0 ? (
          <VideoComponent id={remoteParticipantIds[0]} />
        ) : (
          <div className="w-full h-[600px] bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-purple-400/30 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-400/30 backdrop-blur-sm">
                <Bot className="w-12 h-12 text-purple-400" />
              </div>
              <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-white text-xl font-medium">Connecting to Eden...</p>
              <p className="text-white/70 text-sm mt-2">Preparing your personalized learning session</p>
            </div>
          </div>
        )}

        {/* Draggable local video preview */}
        <DraggableVideoPreview 
          localParticipantId={localParticipantId}
          isCameraEnabled={isCameraEnabled}
        />
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button
          variant={isMicEnabled ? 'primary' : 'secondary'}
          size="lg"
          onClick={toggleMicrophone}
          className="w-16 h-16 rounded-full"
        >
          {isMicEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </Button>
        
        <Button
          variant={isCameraEnabled ? 'primary' : 'secondary'}
          size="lg"
          onClick={toggleCamera}
          className="w-16 h-16 rounded-full"
        >
          {isCameraEnabled ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          onClick={onLeave}
          className="w-16 h-16 rounded-full border-red-400/50 text-red-400 hover:bg-red-500/20"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>
      <DailyAudio />
    </div>
  )
}

// Mock recent feed topics for context
const recentFeedTopics = [
  'Neural Networks and Deep Learning',
  'Quantum Computing Applications',
  'Machine Learning Algorithms',
  'Artificial Intelligence Ethics',
  'Data Science Fundamentals'
]

// Component to format AI response text naturally without markdown
const FormattedMessage: React.FC<{ content: string }> = ({ content }) => {
  const formatText = (text: string) => {
    // Clean up the text by removing markdown-style formatting
    let cleanText = text
      // Remove markdown headers
      .replace(/#{1,6}\s*/g, '')
      // Remove horizontal rules
      .replace(/---+/g, '')
      // Remove excessive asterisks but keep emphasis
      .replace(/\*{3,}/g, '')
      // Clean up bold formatting - keep the emphasis but make it natural
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove bullet point asterisks at start of lines
      .replace(/^\*\s+/gm, '')
      // Clean up numbered lists to be more natural
      .replace(/^\d+\.\s+/gm, '')

    // Split into paragraphs and sentences for natural formatting
    const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim())
    
    return paragraphs.map((paragraph, pIndex) => {
      const trimmed = paragraph.trim()
      if (!trimmed) return null

      // Split paragraph into sentences for better readability
      const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(s => s.trim())
      
      // Check if this looks like a topic header (short line ending with colon)
      if (trimmed.endsWith(':') && trimmed.length < 80) {
        return (
          <div key={pIndex} className="mb-4">
            <h4 className="font-semibold text-purple-300 text-lg mb-2">
              {trimmed}
            </h4>
          </div>
        )
      }

      // Check if this looks like a question
      if (trimmed.endsWith('?')) {
        return (
          <div key={pIndex} className="mb-4">
            <div className="bg-purple-500/20 rounded-lg p-4 border-l-4 border-purple-400">
              <p className="text-purple-200 font-medium leading-relaxed">
                {trimmed}
              </p>
            </div>
          </div>
        )
      }

      // Check if this looks like a list item (starts with number or has list-like structure)
      if (/^\d+[\.\)]\s/.test(trimmed) || trimmed.includes(': ')) {
        return (
          <div key={pIndex} className="mb-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-white/90 leading-relaxed">
                {trimmed.replace(/^\d+[\.\)]\s*/, '')}
              </p>
            </div>
          </div>
        )
      }

      // Regular paragraph with natural sentence breaks
      return (
        <div key={pIndex} className="mb-4">
          <p className="text-white/90 leading-relaxed">
            {sentences.map((sentence, sIndex) => (
              <span key={sIndex}>
                {sentence.trim()}
                {sIndex < sentences.length - 1 && ' '}
              </span>
            ))}
          </p>
        </div>
      )
    })
  }

  return (
    <div className="space-y-2">
      {formatText(content)}
    </div>
  )
}

interface TextChatProps {
  openRouterApiKey: string | null
}

const TextChat: React.FC<TextChatProps> = ({ openRouterApiKey }) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    { 
      id: '1', 
      content: `Hi! I'm Eden. I can help explain topics, answer questions, or create quizzes. What would you like to learn about?`, 
      role: 'assistant',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [streamingResponse, setStreamingResponse] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Initialize DeepSeek chat hook
  const { sendMessage: sendDeepSeekMessage, isLoading, isConfigured } = useDeepSeekChat(openRouterApiKey)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingResponse])

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [inputMessage])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !openRouterApiKey || !isConfigured) return

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    // Send to DeepSeek AI via OpenRouter for chat response
    await sendDeepSeekMessage(
      [...messages, userMessage],
      (aiResponse) => {
        setMessages(prev => [...prev, aiResponse])
        setStreamingResponse('')
      },
      (chunk) => {
        setStreamingResponse(prev => prev + chunk)
      }
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleQuickAction = (action: string) => {
    let message = ''
    switch (action) {
      case 'explain':
        message = `Can you explain one of the recent topics from my feed in simple terms?`
        break
      case 'quiz':
        message = `Create a quick quiz based on the topics I've been reading about.`
        break
      case 'homework':
        message = `I need help understanding a concept from my recent feed content.`
        break
      case 'tips':
        message = `Give me study tips for the topics I've been exploring.`
        break
    }
    setInputMessage(message)
    // Focus the textarea after setting the message
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }

  if (!openRouterApiKey || !isConfigured) {
    return (
      <div className="flex items-center justify-center h-[700px]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            OpenRouter API Key Required
          </h3>
          <p className="text-white/70 max-w-md">
            To use the text chat feature, please add your OpenRouter API key to the environment variables as VITE_OPENROUTER_API_KEY.
          </p>
          <div className="mt-4 p-4 bg-white/5 rounded-lg text-left backdrop-blur-sm border border-white/10">
            <p className="text-sm text-white/70 mb-2">Expected API key format:</p>
            <code className="text-xs bg-white/10 px-2 py-1 rounded">
              sk-or-v1-...
            </code>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[700px]">
      {/* Context Banner */}
      <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-4 mb-4 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className="font-medium text-purple-200">Context from Your Feed</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {recentFeedTopics.slice(0, 3).map((topic, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs font-medium bg-purple-500/30 text-purple-200 rounded-full border border-purple-400/30"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex items-start gap-3 max-w-xs lg:max-w-3xl">
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 border border-purple-400/30">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
              )}
              <div
                className={`px-5 py-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white/10 text-white shadow-sm border border-white/20 backdrop-blur-sm'
                }`}
              >
                {message.role === 'assistant' ? (
                  <FormattedMessage content={message.content} />
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Streaming response */}
        {streamingResponse && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3 max-w-xs lg:max-w-3xl">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 border border-purple-400/30">
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-white/10 shadow-sm text-white border border-white/20 backdrop-blur-sm">
                <FormattedMessage content={streamingResponse} />
                <span className="inline-block w-2 h-5 bg-purple-400 ml-1 animate-pulse rounded"></span>
              </div>
            </div>
          </div>
        )}
        
        {isLoading && !streamingResponse && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3 max-w-xs lg:max-w-md">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 border border-purple-400/30">
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-white/10 shadow-sm backdrop-blur-sm border border-white/20">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-4 bg-white/5 rounded-lg mb-4 backdrop-blur-sm border border-white/10">
        <button
          onClick={() => handleQuickAction('explain')}
          className="flex items-center gap-2 p-3 text-sm bg-white/10 rounded-lg hover:bg-white/15 transition-colors shadow-sm backdrop-blur-sm border border-white/10"
        >
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <span className="text-white/90">Explain</span>
        </button>
        <button
          onClick={() => handleQuickAction('quiz')}
          className="flex items-center gap-2 p-3 text-sm bg-white/10 rounded-lg hover:bg-white/15 transition-colors shadow-sm backdrop-blur-sm border border-white/10"
        >
          <Target className="w-4 h-4 text-green-400" />
          <span className="text-white/90">Quiz Me</span>
        </button>
        <button
          onClick={() => handleQuickAction('homework')}
          className="flex items-center gap-2 p-3 text-sm bg-white/10 rounded-lg hover:bg-white/15 transition-colors shadow-sm backdrop-blur-sm border border-white/10"
        >
          <HelpCircle className="w-4 h-4 text-blue-400" />
          <span className="text-white/90">Help</span>
        </button>
        <button
          onClick={() => handleQuickAction('tips')}
          className="flex items-center gap-2 p-3 text-sm bg-white/10 rounded-lg hover:bg-white/15 transition-colors shadow-sm backdrop-blur-sm border border-white/10"
        >
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span className="text-white/90">Tips</span>
        </button>
      </div>

      {/* Enhanced Input Area */}
      <div className="border-t border-white/10 p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your feed content, request explanations, or get study help..."
              disabled={isLoading}
              rows={1}
              className="w-full resize-none rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-white/60 backdrop-blur-sm focus:bg-white/15 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 transition-all"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="h-12 w-12 rounded-xl flex-shrink-0 p-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 active:from-purple-800 active:to-blue-800 disabled:from-neutral-600 disabled:to-neutral-700 disabled:opacity-50 text-white transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:transform-none disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3 text-xs text-white/60 text-center">
          Powered by DeepSeek V3 via OpenRouter • Free AI model
        </div>
      </div>
    </div>
  )
}

const ApiKeySetup: React.FC<{ onApiKeySet: (key: string) => void }> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('')
  const [isValidating, setIsValidating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKey.trim()) return

    setIsValidating(true)
    // Simple validation - just check if it looks like an API key
    if (apiKey.trim().length > 10) {
      onApiKeySet(apiKey.trim())
    }
    setIsValidating(false)
  }

  return (
    <div className="text-center p-12">
      <div className="mb-8">
        <div className="w-32 h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-400/30 backdrop-blur-sm">
          <Settings className="w-16 h-16 text-purple-400" />
        </div>
        <h3 className="text-3xl font-bold text-white mb-4">
          Setup Required
        </h3>
        <p className="text-white/70 text-lg max-w-lg mx-auto mb-6">
          To enable video conversations with Eden, please enter your Tavus API key. You can get one from the Tavus platform.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Tavus API key"
          className="text-center"
        />
        <Button 
          type="submit"
          disabled={!apiKey.trim() || isValidating}
          size="lg"
          className="w-full"
        >
          {isValidating ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
              Validating...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </form>

      <div className="mt-6 text-sm text-white/60">
        <p className="mb-2">Don't have a Tavus API key?</p>
        <a 
          href="https://platform.tavus.io/api-keys" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 underline"
        >
          Get one from Tavus Platform →
        </a>
      </div>
    </div>
  )
}

export const BrainMate: React.FC = () => {
  const [conversation, setConversation] = useState<IConversation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatMode, setChatMode] = useState<'video' | 'text'>('text')
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [openRouterApiKey, setOpenRouterApiKey] = useState<string | null>(null)
  const DailyCall = useDaily()

  // Check for API keys in environment variables on mount
  useEffect(() => {
    const envApiKey = import.meta.env.VITE_TAVUS_API_KEY || '2b65ef86349841bbbee6451902796a78'
    if (envApiKey) {
      setApiKey(envApiKey)
    }

    // Use the provided OpenRouter API key
    const providedOpenRouterApiKey = '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'
    console.log('Using provided OpenRouter API Key')
    setOpenRouterApiKey(providedOpenRouterApiKey)
  }, [])

  const handlePermissionsGranted = () => {
    setPermissionsGranted(true)
    setPermissionError(null)
  }

  const handlePermissionsDenied = (errorMessage: string) => {
    setPermissionError(errorMessage)
    setPermissionsGranted(false)
  }

  const handleApiKeySet = (key: string) => {
    setApiKey(key)
    setError(null)
  }

  const startVideoCall = async () => {
    if (!apiKey) {
      setError('Tavus API key is required for video calls')
      return
    }

    if (!permissionsGranted) {
      setError('Camera and microphone permissions are required for video calls')
      return
    }

    if (DailyCall && !conversation && !loading) {
      setLoading(true)
      setError(null)
      try {
        const newConversation = await createConversation(apiKey)
        await DailyCall.join({ 
          url: newConversation.conversation_url,
          startVideoOff: false,
          startAudioOff: false
        })
        setConversation(newConversation)
      } catch (error) {
        setError(`Failed to start video call: ${error}`)
      }
      setLoading(false)
    }
  }

  const endVideoCall = () => {
    DailyCall?.leave()
    if (conversation && apiKey) {
      endConversation(conversation.conversation_id, apiKey)
    }
    setConversation(null)
  }

  const switchToVideoMode = () => {
    setChatMode('video')
    if (!apiKey) {
      // API key setup will be shown
      return
    }
    if (permissionsGranted && !conversation) {
      startVideoCall()
    }
  }

  const switchToTextMode = () => {
    setChatMode('text')
    if (conversation) {
      endVideoCall()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            Eden
          </h1>
          <p className="text-white/70 mt-1">Your AI learning companion</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={chatMode === 'video' ? 'primary' : 'outline'}
            size="sm"
            onClick={switchToVideoMode}
            disabled={loading}
          >
            <Video className="w-4 h-4 mr-2" />
            Video Chat
          </Button>
          <Button
            variant={chatMode === 'text' ? 'primary' : 'outline'}
            size="sm"
            onClick={switchToTextMode}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Text Chat
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {chatMode === 'video' ? (
            <div className="p-6">
              {!apiKey ? (
                <ApiKeySetup onApiKeySet={handleApiKeySet} />
              ) : !permissionsGranted ? (
                <MediaPermissions 
                  onPermissionsGranted={handlePermissionsGranted}
                  onPermissionsDenied={handlePermissionsDenied}
                />
              ) : conversation ? (
                <VideoCall onLeave={endVideoCall} />
              ) : (
                <div className="text-center py-16">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-400/30 backdrop-blur-sm">
                    <Bot className="w-16 h-16 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    Ready for your learning session?
                  </h3>
                  <p className="text-white/70 mb-6 max-w-md mx-auto">
                    Start a video conversation with Eden to discuss topics from your feed and get personalized learning assistance.
                  </p>
                  <Button onClick={startVideoCall} disabled={loading} size="lg" className="px-8 py-4">
                    {loading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                        Starting Session...
                      </>
                    ) : (
                      <>
                        <Video className="w-5 h-5 mr-3" />
                        Start Video Session
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <TextChat openRouterApiKey={openRouterApiKey} />
            </div>
          )}

          {(error || permissionError) && (
            <div className="m-6 p-4 bg-red-500/20 border border-red-400/30 text-red-300 rounded-lg backdrop-blur-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error || permissionError}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
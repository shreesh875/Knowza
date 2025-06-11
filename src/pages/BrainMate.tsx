import React, { useState, useEffect, useRef } from 'react'
import { useDaily, DailyVideo, useParticipantIds, useLocalSessionId, useAudioTrack, useVideoTrack, DailyAudio } from '@daily-co/daily-react'
import { Mic, MicOff, PhoneOff, MessageCircle, Send, Camera, CameraOff, AlertCircle, Video, Bot } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { createConversation } from '../api/createConversation'
import { endConversation } from '../api/endConversation'
import { sendChatMessage, type ChatMessage } from '../services/openai'
import type { IConversation } from '../types'

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
    <div className="relative w-full h-[500px] bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
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
        <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Camera className="w-12 h-12 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
          Ready to Meet BrainMate?
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-md mx-auto">
          BrainMate needs access to your camera and microphone to provide the best video learning experience.
        </p>
      </div>
      
      <Button 
        onClick={requestPermissions} 
        disabled={requesting}
        size="lg"
        className="mb-6"
      >
        {requesting ? (
          <>
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
            Requesting Access...
          </>
        ) : (
          <>
            <Camera className="w-5 h-5 mr-3" />
            Allow Camera & Microphone
          </>
        )}
      </Button>
      
      <div className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
        Your privacy is important. We only use your camera and microphone for video calls and never store or share your data.
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
      {remoteParticipantIds.length > 0 ? (
        <VideoComponent id={remoteParticipantIds[0]} />
      ) : (
        <div className="w-full h-[500px] bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">Connecting to BrainMate...</p>
            <p className="text-neutral-500 dark:text-neutral-500 text-sm mt-2">This may take a few moments</p>
          </div>
        </div>
      )}

      {/* Local video preview */}
      {localParticipantId && (
        <div className="relative">
          <div className="absolute top-4 right-4 w-40 h-32 bg-neutral-900 rounded-lg overflow-hidden border-2 border-white shadow-lg z-10">
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
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        <Button
          variant={isMicEnabled ? 'primary' : 'secondary'}
          size="lg"
          onClick={toggleMicrophone}
          className="w-14 h-14 rounded-full"
        >
          {isMicEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </Button>
        
        <Button
          variant={isCameraEnabled ? 'primary' : 'secondary'}
          size="lg"
          onClick={toggleCamera}
          className="w-14 h-14 rounded-full"
        >
          {isCameraEnabled ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          onClick={onLeave}
          className="w-14 h-14 rounded-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>
      <DailyAudio />
    </div>
  )
}

const TextChat: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: 'user' | 'ai' }>>([
    { id: '1', text: 'Hello! I\'m BrainMate, your AI learning companion. How can I help you learn something new today?', sender: 'ai' }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const newMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user' as const
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const chatMessages: ChatMessage[] = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }))
      
      chatMessages.push({ role: 'user', content: inputMessage })

      const response = await sendChatMessage(chatMessages)
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai' as const
      }
      
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai' as const
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex items-start gap-3 max-w-xs lg:max-w-md">
              {message.sender === 'ai' && (
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
              )}
              <div
                className={`px-4 py-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-700 dark:text-white'
                }`}
              >
                {message.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3 max-w-xs lg:max-w-md">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-700">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200 dark:border-neutral-700 p-4">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask BrainMate anything..."
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export const BrainMate: React.FC = () => {
  const [conversation, setConversation] = useState<IConversation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatMode, setChatMode] = useState<'video' | 'text'>('video')
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const DailyCall = useDaily()

  const apiKey = import.meta.env.VITE_TAVUS_API_KEY

  const handlePermissionsGranted = () => {
    setPermissionsGranted(true)
    setPermissionError(null)
  }

  const handlePermissionsDenied = (errorMessage: string) => {
    setPermissionError(errorMessage)
    setPermissionsGranted(false)
  }

  const startVideoCall = async () => {
    if (!apiKey) {
      setError('Tavus API key not found in environment variables')
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
    if (conversation) {
      endConversation(conversation.conversation_id, apiKey)
    }
    setConversation(null)
  }

  const switchToVideoMode = () => {
    setChatMode('video')
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
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">BrainMate</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Your AI learning companion</p>
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
              {!permissionsGranted ? (
                <MediaPermissions 
                  onPermissionsGranted={handlePermissionsGranted}
                  onPermissionsDenied={handlePermissionsDenied}
                />
              ) : conversation ? (
                <VideoCall onLeave={endVideoCall} />
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bot className="w-12 h-12 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                    Ready to start your video session?
                  </h3>
                  <Button onClick={startVideoCall} disabled={loading} size="lg">
                    {loading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                        Starting Video Call...
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
            <TextChat />
          )}

          {(error || permissionError) && (
            <div className="m-6 p-4 bg-error-50 border border-error-200 text-error-700 rounded-lg dark:bg-error-900/20 dark:border-error-800 dark:text-error-400 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error || permissionError}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-medium text-neutral-900 dark:text-white mb-1">Explain Concepts</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Get clear explanations</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-medium text-neutral-900 dark:text-white mb-1">Homework Help</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Get assistance with assignments</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-medium text-neutral-900 dark:text-white mb-1">Quiz Practice</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Test your knowledge</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Send className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-medium text-neutral-900 dark:text-white mb-1">Study Tips</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Improve your learning</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
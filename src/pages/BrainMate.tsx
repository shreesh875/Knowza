import React, { useState, useEffect, useRef } from 'react'
import { useDaily, DailyVideo, useParticipantIds, useLocalSessionId, useAudioTrack, useVideoTrack, DailyAudio } from '@daily-co/daily-react'
import { Mic, MicOff, PhoneOff, MessageCircle, Send, Camera, CameraOff, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { createConversation } from '../api/createConversation'
import { endConversation } from '../api/endConversation'
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

const Video: React.FC<{ id: string }> = ({ id }) => {
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
    <div className="relative w-full h-96 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
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
      // Request both audio and video permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      })
      
      // Stop the stream immediately as we just needed to check permissions
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
    <div className="text-center p-8">
      <div className="mb-6">
        <Camera className="w-16 h-16 text-primary-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
          Camera and Microphone Access Required
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          BrainMate needs access to your camera and microphone to provide the best video chat experience.
        </p>
      </div>
      
      <Button 
        onClick={requestPermissions} 
        disabled={requesting}
        className="mb-4"
      >
        {requesting ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Requesting Access...
          </>
        ) : (
          <>
            <Camera className="w-4 h-4 mr-2" />
            Allow Camera & Microphone
          </>
        )}
      </Button>
      
      <div className="text-xs text-neutral-500 dark:text-neutral-400">
        Your privacy is important. We only use your camera and microphone for video calls.
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
    <div className="space-y-4">
      {remoteParticipantIds.length > 0 ? (
        <Video id={remoteParticipantIds[0]} />
      ) : (
        <div className="w-full h-96 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Connecting to BrainMate...</p>
          </div>
        </div>
      )}

      {/* Local video preview */}
      {localParticipantId && (
        <div className="relative">
          <div className="absolute top-4 right-4 w-32 h-24 bg-neutral-900 rounded-lg overflow-hidden border-2 border-white shadow-lg z-10">
            <DailyVideo
              sessionId={localParticipantId}
              type="video"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {!isCameraEnabled && (
              <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
                <CameraOff className="w-6 h-6 text-neutral-400" />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        <Button
          variant={isMicEnabled ? 'primary' : 'secondary'}
          size="sm"
          onClick={toggleMicrophone}
        >
          {isMicEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </Button>
        
        <Button
          variant={isCameraEnabled ? 'primary' : 'secondary'}
          size="sm"
          onClick={toggleCamera}
        >
          {isCameraEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
        </Button>
        
        <Button variant="outline" size="sm" onClick={onLeave}>
          <PhoneOff className="w-4 h-4" />
        </Button>
      </div>
      <DailyAudio />
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
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: 'user' | 'ai' }>>([
    { id: '1', text: 'Hello! I\'m BrainMate, your AI learning companion. How can I help you today?', sender: 'ai' }
  ])
  const [inputMessage, setInputMessage] = useState('')
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
        setChatMode('video')
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
    setChatMode('text')
  }

  const sendMessage = () => {
    if (!inputMessage.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user' as const
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: 'That\'s a great question! Let me help you understand that concept better. Would you like me to explain it step by step?',
        sender: 'ai' as const
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const switchToVideoMode = () => {
    if (permissionsGranted) {
      startVideoCall()
    } else {
      setChatMode('video')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">BrainMate</h1>
        <div className="flex gap-2">
          <Button
            variant={chatMode === 'text' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setChatMode('text')}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Text Chat
          </Button>
          <Button
            variant={chatMode === 'video' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => chatMode === 'video' ? endVideoCall() : switchToVideoMode()}
            disabled={loading}
          >
            {loading ? 'Connecting...' : chatMode === 'video' && conversation ? 'End Video' : 'Video Chat'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {chatMode === 'video' ? 'Video Chat' : 'Text Chat'}
              </h2>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              {chatMode === 'video' ? (
                <>
                  {!permissionsGranted ? (
                    <MediaPermissions 
                      onPermissionsGranted={handlePermissionsGranted}
                      onPermissionsDenied={handlePermissionsDenied}
                    />
                  ) : conversation ? (
                    <VideoCall onLeave={endVideoCall} />
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <Button onClick={startVideoCall} disabled={loading}>
                        {loading ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Starting Video Call...
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 mr-2" />
                            Start Video Call
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender === 'user'
                              ? 'bg-primary-600 text-white'
                              : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-700 dark:text-white'
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask BrainMate anything..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}

              {(error || permissionError) && (
                <div className="mt-4 p-3 bg-error-50 border border-error-200 text-error-700 rounded-lg dark:bg-error-900/20 dark:border-error-800 dark:text-error-400 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error || permissionError}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Quick Actions</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                Explain a concept
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Help with homework
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Quiz me on topics
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                Study tips
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Recent Topics</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                • Neural Networks
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                • Quantum Computing
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                • Machine Learning
              </div>
            </CardContent>
          </Card>

          {chatMode === 'video' && (
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-neutral-900 dark:text-white">Video Settings</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {permissionsGranted ? (
                    <div className="flex items-center gap-2 text-success-600 dark:text-success-400">
                      <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                      Camera & Mic Ready
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-warning-600 dark:text-warning-400">
                      <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                      Permissions Required
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
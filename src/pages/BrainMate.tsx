import React, { useState, useEffect, useRef } from 'react'
import { useDaily, DailyVideo, useParticipantIds, useLocalSessionId, useAudioTrack, DailyAudio } from '@daily-co/daily-react'
import { Mic, MicOff, PhoneOff, MessageCircle, Send } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { createConversation } from '../api/createConversation'
import { endConversation } from '../api/endConversation'
import type { IConversation } from '../types'

// WebGL Shader Programs for Chroma Key Effect (same as original)
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
    <div className="relative w-full h-64 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
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

const VideoCall: React.FC<{ onLeave: () => void }> = ({ onLeave }) => {
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' })
  const localParticipantId = useLocalSessionId()
  const localAudio = useAudioTrack(localParticipantId)
  const daily = useDaily()
  const isMicEnabled = !localAudio.isOff

  const toggleMicrophone = () => {
    daily?.setLocalAudio(!isMicEnabled)
  }

  return (
    <div className="space-y-4">
      {remoteParticipantIds.length > 0 ? (
        <Video id={remoteParticipantIds[0]} />
      ) : (
        <div className="w-full h-64 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Connecting to BrainMate...</p>
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
  const [chatMode, setChatMode] = useState<'video' | 'text'>('video')
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: 'user' | 'ai' }>>([
    { id: '1', text: 'Hello! I\'m BrainMate, your AI learning companion. How can I help you today?', sender: 'ai' }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const DailyCall = useDaily()

  const apiKey = import.meta.env.VITE_TAVUS_API_KEY

  const startVideoCall = async () => {
    if (!apiKey) {
      setError('Tavus API key not found in environment variables')
      return
    }

    if (DailyCall && !conversation && !loading) {
      setLoading(true)
      setError(null)
      try {
        const newConversation = await createConversation(apiKey)
        await DailyCall.join({ url: newConversation.conversation_url })
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
            onClick={() => chatMode === 'video' ? endVideoCall() : startVideoCall()}
            disabled={loading}
          >
            {loading ? 'Connecting...' : chatMode === 'video' ? 'End Video' : 'Video Chat'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-96">
            <CardHeader>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {chatMode === 'video' ? 'Video Chat' : 'Text Chat'}
              </h2>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              {chatMode === 'video' && conversation ? (
                <VideoCall onLeave={endVideoCall} />
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

              {error && (
                <div className="mt-4 p-3 bg-error-50 border border-error-200 text-error-700 rounded-lg dark:bg-error-900/20 dark:border-error-800 dark:text-error-400">
                  {error}
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
        </div>
      </div>
    </div>
  )
}
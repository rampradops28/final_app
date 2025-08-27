import { useState, useRef, useCallback, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function useVoiceRecognition(onCommand) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [lastCommand, setLastCommand] = useState("")
  const [currentLanguage, setCurrentLanguage] = useState("en-US")
  const recognitionRef = useRef(null)
  const { toast } = useToast()

  // Check for speech recognition support
  useEffect(() => {
    const checkSupport = () => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition

      console.log("Checking voice support:", {
        SpeechRecognition: !!SpeechRecognition,
        userAgent: navigator.userAgent,
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol,
      })

      if (SpeechRecognition) {
        setIsSupported(true)
        console.log("Voice recognition is supported!")
      } else {
        setIsSupported(false)
        console.log("Voice recognition not supported")
      }
    }

    checkSupport()
    setTimeout(checkSupport, 1000)
  }, [])

  const initializeRecognition = useCallback(() => {
    if (typeof window === "undefined") return

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    console.log("Initializing recognition:", {
      SpeechRecognition: !!SpeechRecognition,
      isSupported,
      browser: navigator.userAgent,
    })

    if (!SpeechRecognition) {
      setIsSupported(false)
      console.error("SpeechRecognition not available")
      return
    }

    setIsSupported(true)
    const recognition = new SpeechRecognition()

    toast({
      title: "Voice Recognition Ready",
      description:
        "You can now use voice commands! Click the microphone to start.",
    })

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = currentLanguage

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }

      if (finalTranscript.trim()) {
        const command = finalTranscript.trim().toLowerCase()
        setLastCommand(command)
        onCommand(command)
      }
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)

      let errorMessage = "Speech recognition failed"
      switch (event.error) {
        case "not-allowed":
          errorMessage =
            "Microphone access denied. Please allow microphone access and try again."
          break
        case "no-speech":
          errorMessage =
            "No speech detected. Please speak clearly and try again."
          break
        case "network":
          errorMessage =
            "Network error. Voice recognition works best with HTTPS."
          break
        case "service-not-allowed":
          errorMessage =
            "Speech service not allowed. Please use Chrome/Edge browser with HTTPS."
          break
        default:
          errorMessage = `Speech recognition error: ${event.error}`
      }

      toast({
        title: "Voice Recognition Error",
        description: errorMessage,
        variant: "destructive",
      })
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
  }, [onCommand, toast, currentLanguage])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      initializeRecognition()
    }

    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error("Failed to start recognition:", error)
        toast({
          title: "Voice Recognition Error",
          description: "Failed to start voice recognition",
          variant: "destructive",
        })
      }
    }
  }, [isListening, initializeRecognition, toast])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  const setLanguage = useCallback(
    (lang) => {
      setCurrentLanguage(lang)
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop()
        setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.lang = lang
            recognitionRef.current.start()
          }
        }, 100)
      }
    },
    [isListening]
  )

  return {
    isListening,
    isSupported,
    lastCommand,
    startListening,
    stopListening,
    toggleListening,
    setLanguage,
  }
}

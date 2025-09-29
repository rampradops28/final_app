import { useState, useRef, useCallback, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function useVoiceRecognition(onCommand) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [lastCommand, setLastCommand] = useState("")
  const [currentLanguage, setCurrentLanguage] = useState("en-US")
  const recognitionRef = useRef(null)
  const lastProcessedRef = useRef({ text: '', at: 0 })
  const commandCountRef = useRef(0)
  const shouldContinueRef = useRef(false)
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

  const mapLangForRecognition = (lang) => {
    if (!lang) return "en-US"
    // Treat mixed mode as English for browser SpeechRecognition
    if (lang === "mixed") return "en-US"
    return lang
  }

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

    // Continuous session: keep listening across multiple commands
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = mapLangForRecognition(currentLanguage)

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      // Only process the latest final result to avoid duplicates
      const results = event.results
      const last = results[results.length - 1]
      if (!last || !last.isFinal) return

      const text = String(last[0]?.transcript || '').trim().toLowerCase()
      if (!text) return

      // Throttle duplicates within 900ms or same text
      const now = Date.now()
      const { text: prevText, at } = lastProcessedRef.current
      if (text === prevText && now - at < 900) {
        return
      }
      lastProcessedRef.current = { text, at: now }

      setLastCommand(text)
      try {
        onCommand(text)
        commandCountRef.current += 1
      } catch (e) {
        console.error('onCommand failed', e)
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
      // Auto-restart only if user didn't explicitly stop
      if (shouldContinueRef.current) {
        // Brief backoff after several commands to avoid browser throttling
        const delay = commandCountRef.current > 3 ? 150 : 30
        setTimeout(() => {
          try { recognition.start() } catch (_) {}
        }, delay)
      } else {
        setIsListening(false)
      }
    }

    recognitionRef.current = recognition
  }, [onCommand, toast, currentLanguage])

  const startListening = useCallback(() => {
    // Do not attempt to start recognition while offline
    if (typeof navigator !== 'undefined' && navigator && navigator.onLine === false) {
      console.warn('Offline: speech recognition requires network in Chrome/Edge')
      toast({
        title: 'Offline',
        description:
          'Voice recognition requires an internet connection in this browser. Please go online to use the mic.',
        variant: 'destructive',
      })
      return
    }

    if (!recognitionRef.current) {
      initializeRecognition()
    }

    if (recognitionRef.current && !isListening) {
      try {
        shouldContinueRef.current = true
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
    shouldContinueRef.current = false
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
            recognitionRef.current.lang = mapLangForRecognition(lang)
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
    currentLanguage,
  }
}

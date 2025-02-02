import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Camera, AlertTriangle } from 'lucide-react'
import { VerificationResult } from './verification-result'
import { BankIDStep } from './bank-id-step'
import { MojeIDStep } from './moje-id-step'
import { IDScanStep } from './id-scan-step'
import * as faceapi from '@vladmandic/face-api'

export function FaceScanStep({ onBack }: { onBack: () => void }) {
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [estimatedAge, setEstimatedAge] = useState<number | null>(null)
  const [verificationResult, setVerificationResult] = useState<'passed' | 'failed' | 'uncertain' | null>(null)
  const [selectedAlternativeMethod, setSelectedAlternativeMethod] = useState<'bankid' | 'mojeid' | 'ocr' | null>(null)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [modelLoadingError, setModelLoadingError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const loadModels = async () => {
      try {
        const modelPath = `${window.location.origin}/models`
        console.log('Attempting to load models from:', modelPath)
        
        await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath)
        console.log('TinyFaceDetector model loaded successfully')
        
        await faceapi.nets.ageGenderNet.loadFromUri(modelPath)
        console.log('AgeGenderNet model loaded successfully')
        
        setModelsLoaded(true)
        console.log('All face detection models loaded successfully')
      } catch (error) {
        console.error('Error loading face detection models:', error)
        let errorMessage = 'Unknown error occurred while loading models'
        if (error instanceof Error) {
          errorMessage = error.message
        } else if (typeof error === 'string') {
          errorMessage = error
        }
        setModelLoadingError(`Failed to load face detection models: ${errorMessage}`)
      }
    }

    loadModels()
  }, [])

  useEffect(() => {
    if (isCameraActive) {
      startCamera()
    } else {
      stopCamera()
    }
  }, [isCameraActive])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Error accessing the camera:", err)
      let errorMessage = 'Unknown error occurred while accessing the camera'
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'string') {
        errorMessage = err
      }
      setModelLoadingError(`Failed to access the camera: ${errorMessage}`)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
  }

  const handleStartScan = () => {
    if (!modelsLoaded) {
      console.error("Face detection models are not loaded yet")
      return
    }
    setIsCameraActive(true)
    setIsScanning(true)
    estimateAge()
  }

  const estimateAge = async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return

    const video = videoRef.current
    const canvas = canvasRef.current

    const displaySize = { width: video.videoWidth, height: video.videoHeight }
    faceapi.matchDimensions(canvas, displaySize)

    try {
      const interval = setInterval(async () => {
        const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withAgeAndGender()

        if (detections) {
          const resizedDetections = faceapi.resizeResults(detections, displaySize)
          canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
          faceapi.draw.drawDetections(canvas, resizedDetections)

          if (detections.age) {
            setEstimatedAge(Math.round(detections.age))
            clearInterval(interval)
            setIsScanning(false)
            setScanComplete(true)
            setIsCameraActive(false)
            determineVerificationResult(Math.round(detections.age))
          }
        }
      }, 100)
    } catch (error) {
      console.error("Error during face detection:", error)
      let errorMessage = 'Unknown error occurred during face detection'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      setIsScanning(false)
      setModelLoadingError(`An error occurred during face detection: ${errorMessage}`)
    }
  }

  const determineVerificationResult = (age: number) => {
    if (age < 18) {
      setVerificationResult('failed')
    } else if (age >= 18 && age < 25) {
      setVerificationResult('uncertain')
    } else {
      setVerificationResult('passed')
    }
  }

  const handleAlternativeMethodSelect = (method: 'bankid' | 'mojeid' | 'ocr') => {
    setSelectedAlternativeMethod(method)
  }

  if (verificationResult === 'passed') {
    return <VerificationResult isVerified={true} />
  }

  if (verificationResult === 'failed') {
    return <VerificationResult isVerified={false} />
  }

  if (selectedAlternativeMethod === 'bankid') {
    return <BankIDStep onBack={() => setSelectedAlternativeMethod(null)} />
  }

  if (selectedAlternativeMethod === 'mojeid') {
    return <MojeIDStep onBack={() => setSelectedAlternativeMethod(null)} />
  }

  if (selectedAlternativeMethod === 'ocr') {
    return <IDScanStep onBack={() => setSelectedAlternativeMethod(null)} />
  }

  return (
    <div className="max-w-md mx-auto">
      <Button
        variant="ghost"
        className="mb-6 text-primary hover:text-primary-light"
        onClick={onBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Zpět na výběr metody
      </Button>
      <Card className="bg-white shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-primary mb-4">FaceScan</h2>
          <p className="text-gray-light mb-6">
            Pro ověření věku prosím naskenujte svůj obličej. Ujistěte se, že jste v dobře osvětleném prostředí a dívejte se přímo do kamery.
          </p>
          <div className="relative aspect-video mb-4 bg-gray-100 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {modelLoadingError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{modelLoadingError}</span>
            </div>
          )}
          {!scanComplete && (
            <Button
              onClick={handleStartScan}
              disabled={isScanning || !modelsLoaded || !!modelLoadingError}
              className="w-full bg-primary text-white hover:bg-primary/90"
            >
              {isScanning ? 'Skenování...' : modelsLoaded ? 'Zahájit skenování' : 'Načítání modelů...'}
              <Camera className="ml-2 h-4 w-4" />
            </Button>
          )}
          {scanComplete && verificationResult === 'uncertain' && (
            <div className="mt-4">
              <p className="text-center text-yellow-600 font-semibold mb-4">
                <AlertTriangle className="inline-block mr-2 h-5 w-5" />
                Věk nelze s jistotou ověřit. Prosím, použijte alternativní metodu ověření.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => handleAlternativeMethodSelect('bankid')}
                  className="w-full bg-primary text-white hover:bg-primary/90"
                >
                  Pokračovat s BankID
                </Button>
                <Button
                  onClick={() => handleAlternativeMethodSelect('mojeid')}
                  className="w-full bg-primary text-white hover:bg-primary/90"
                >
                  Pokračovat s MojeID
                </Button>
                <Button
                  onClick={() => handleAlternativeMethodSelect('ocr')}
                  className="w-full bg-primary text-white hover:bg-primary/90"
                >
                  Pokračovat se skenem dokladu
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


import './App.css'
import { useState } from 'react'
import { toast } from "sonner"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const API_KEY = import.meta.env.VITE_BACKEND_API_KEY

function App() {
  const [server, setServer] = useState('api.identivia.com')
  const [name, setName] = useState('')
  const [userID, setUserID] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [country, setCountry] = useState('')
  const [ipAddress, setIpAddress] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [securityLevel, setSecurityLevel] = useState('mid')
  const [gender, setGender] = useState('')
  const [language, setLanguage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!userID) {
      toast.warning('User ID is mandatory')
      return
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.warning('Invalid email format')
      return
    }

    console.log('📝 Testing: Create KYC Record...')

    const createKYCPromise = async () => {
      setIsLoading(true)

      const payload: any = {
        userID: userID,
        securityLevel: securityLevel,
      }

      if (name) payload.name = name
      if (email) payload.email = email
      if (phoneNumber) payload.phoneNumber = phoneNumber
      if (documentNumber) payload.documentNumber = documentNumber
      if (documentType) payload.documentType = documentType === '01' ? 'national_id' : 'passport'
      if (country) payload.country = country
      if (ipAddress) payload.ipAddress = ipAddress
      if (gender) payload.gender = gender
      if (language) payload.language = language

      console.log('Language value:', language)
      console.log('Payload being sent:', payload)

      console.log('Payload being sent:', payload)

      const response = await fetch(`https://${server}/api/profiles/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Response:', data)

      if (data.id && data.url) {
        console.log('\n🔗 Generated URL:', data.url)
        return data
      } else {
        throw new Error('Failed to create KYC record - missing ID or URL')
      }
    }

    toast.promise(createKYCPromise(), {
      loading: 'Creating KYC record...',
      success: (data) => {
        setIsLoading(false)
        // Redirect after a short delay to let user see the success message
        setTimeout(() => {
          window.location.href = data.url
        }, 1500)
        return 'KYC record created successfully! Redirecting...'
      },
      error: (error) => {
        setIsLoading(false)
        console.error('❌ Error:', error)
        return `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      }
    })
  }

  return (
    <>
      <div className="w-full max-w-sd">
        <FieldSet>
          <FieldLegend>Identivia: Demo</FieldLegend>
          <FieldDescription>
            We need your information to verify your identity.
          </FieldDescription>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="userID">User ID</FieldLabel>
                <Input
                  id="userID"
                  type="text"
                  placeholder="user_123"
                  value={userID}
                  onChange={(e) => setUserID(e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="country">Country</FieldLabel>
                <Select
                  value={country}
                  onValueChange={(value) => setCountry(value)}
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALAYSIA">Malaysia</SelectItem>
                    <SelectItem value="THAILAND">Thailand</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="ipAddress">IP Address</FieldLabel>
                <Input
                  id="ipAddress"
                  type="text"
                  placeholder="192.168.1.1"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="document_number">Document Number</FieldLabel>
                <Input
                  id="document_number"
                  type="text"
                  placeholder="123456789"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  disabled={!documentType}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="document_type">
                  Document Type
                </FieldLabel>
                <Select
                  value={documentType}
                  onValueChange={(value) => setDocumentType(value)}
                >
                  <SelectTrigger id="document_type">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national_id">NRIC</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="driving_license">Driver License</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="securityLevel">Security Level</FieldLabel>
                <Select
                  value={securityLevel}
                  onValueChange={(value) => setSecurityLevel(value)}
                >
                  <SelectTrigger id="securityLevel">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="gender">
                  Gender
                </FieldLabel>
                <Select
                  value={gender}
                  onValueChange={(value) => setGender(value)}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="server">Server</FieldLabel>
                <Input
                  id="server"
                  type="text"
                  placeholder="api.identivia.com"
                  list="servers"
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                />
                <datalist id="servers">
                  <option value="api.identivia.com" />
                </datalist>
              </Field>
              <Field>
                <FieldLabel htmlFor="language">Language</FieldLabel>
                <Select
                  value={language}
                  onValueChange={(value) => setLanguage(value)}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="th">Thai</SelectItem>
                    <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Go to Verification'}
            </Button>
          </FieldGroup>
        </FieldSet>
      </div>
    </>
  )
}

export default App

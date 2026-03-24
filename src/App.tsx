import './App.css'
import { useState } from 'react'
import { toast } from "sonner"
// Build: 2026-03-24T01
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
import { Separator } from "@/components/ui/separator"

const MASTER_API_KEY = import.meta.env.VITE_MASTER_API_KEY || ''

type Screen = 'home' | 'master' | 'player' | 'tenant-admin'

interface Tenant {
  id: string
  name: string
  reference_id: string
  api_key: string
}

// Auto-detect screen based on hostname
// master-demo.* → master screen (onboard tenants)
// player-demo.* → player screen (user wallet + KYC withdrawal)
// tenant-demo.* → tenant admin screen (approval list, pending profiles)
function getDefaultScreen(): Screen {
  const hostname = window.location.hostname
  if (hostname.startsWith('master-demo')) return 'master'
  if (hostname.startsWith('player-demo') || hostname.startsWith('player')) return 'player'
  if (hostname.startsWith('tenant-demo')) return 'tenant-admin'
  return 'home'
}

function App() {
  const defaultScreen = getDefaultScreen()
  const [screen, setScreen] = useState<Screen>(defaultScreen)
  const [server, setServer] = useState('api.vanguardkyc.online')

  // If accessed via a specific domain, lock to that screen (hide back/home)
  const isLocked = defaultScreen !== 'home'

  return (
    <div className="w-full max-w-2xl mx-auto">
      {screen === 'home' && <HomeScreen onNavigate={setScreen} />}
      {screen === 'master' && (
        <MasterScreen server={server} setServer={setServer} onBack={isLocked ? undefined : () => setScreen('home')} />
      )}
      {screen === 'player' && (
        <PlayerScreen server={server} setServer={setServer} onBack={isLocked ? undefined : () => setScreen('home')} />
      )}
      {screen === 'tenant-admin' && (
        <TenantAdminScreen server={server} setServer={setServer} onBack={isLocked ? undefined : () => setScreen('home')} />
      )}
    </div>
  )
}

function HomeScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <FieldSet>
      <FieldLegend>VanguardKYC: Multi-Tenant Demo</FieldLegend>
      <FieldDescription>
        Demo the full KYC flow: Onboard tenant, whitelist domains, user withdraws money, admin approves.
      </FieldDescription>
      <FieldGroup>
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">Flow</p>
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>Tenant Onboard</strong> — Master creates tenant + gets API key</li>
            <li><strong>Domain Whitelist</strong> — Master adds tenant's domain to CORS whitelist</li>
            <li><strong>User Withdraw</strong> — Player tries to withdraw, KYC triggered</li>
            <li><strong>Admin Approve</strong> — Tenant admin reviews and approves in admin portal</li>
          </ol>
        </div>
        <Separator />
        <div className="flex flex-col gap-4">
          <Button
            className="h-auto py-6 flex flex-col gap-1"
            variant="outline"
            onClick={() => onNavigate('master')}
          >
            <span className="text-lg font-semibold">Step 1 & 2: Tenant Onboard + Whitelist</span>
            <span className="text-sm text-muted-foreground font-normal">
              Create tenant, get API key, add domain to CORS whitelist
            </span>
          </Button>
          <Button
            className="h-auto py-6 flex flex-col gap-1"
            variant="outline"
            onClick={() => onNavigate('player')}
          >
            <span className="text-lg font-semibold">Step 3: Player Withdrawal + KYC</span>
            <span className="text-sm text-muted-foreground font-normal">
              User logs in, withdraws money, gets redirected to KYC verification
            </span>
          </Button>
          <Button
            className="h-auto py-6 flex flex-col gap-1"
            variant="outline"
            onClick={() => onNavigate('tenant-admin')}
          >
            <span className="text-lg font-semibold">Step 4: Admin Approve</span>
            <span className="text-sm text-muted-foreground font-normal">
              Tenant admin reviews profile and approves/rejects in admin portal
            </span>
          </Button>
        </div>
      </FieldGroup>
    </FieldSet>
  )
}

function MasterScreen({
  server,
  setServer,
  onBack,
}: {
  server: string
  setServer: (s: string) => void
  onBack?: () => void
}) {
  const [tenantName, setTenantName] = useState('')
  const [referenceId, setReferenceId] = useState('')
  const [description, setDescription] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminName, setAdminName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [createdTenant, setCreatedTenant] = useState<Tenant | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreateTenant = async () => {
    if (!tenantName) {
      toast.warning('Tenant name is required')
      return
    }
    if (!adminEmail || !adminPassword) {
      toast.warning('Admin email and password are required')
      return
    }
    if (!MASTER_API_KEY) {
      toast.error('VITE_MASTER_API_KEY is not set')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`https://${server}/api/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': MASTER_API_KEY,
        },
        body: JSON.stringify({
          name: tenantName,
          description: description || undefined,
          reference_id: referenceId || undefined,
          admin_email: adminEmail,
          admin_password: adminPassword,
          admin_name: adminName || undefined,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setCreatedTenant({
        id: data.data.id,
        name: data.data.name,
        reference_id: data.data.reference_id || '',
        api_key: data.data.api_key,
      })
      toast.success(`Tenant "${tenantName}" created!`)
    } catch (error) {
      toast.error(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <FieldSet>
      <FieldLegend>Master: Tenant Onboarding</FieldLegend>
      <FieldDescription>
        Create a new tenant. This simulates a new company signing up for KYC services.
      </FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="server">API Server</FieldLabel>
          <Input
            id="server"
            value={server}
            onChange={(e) => setServer(e.target.value)}
          />
        </Field>

        <Separator />

        {!createdTenant ? (
          <>
            <Field>
              <FieldLabel htmlFor="tenantName">Tenant Name *</FieldLabel>
              <Input
                id="tenantName"
                placeholder="Acme Corp"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="referenceId">Reference ID (your system's ID)</FieldLabel>
              <Input
                id="referenceId"
                placeholder="550e8400-e29b-41d4-a716-446655440000"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Input
                id="description"
                placeholder="Brief description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>

            <Separator />

            <Field>
              <FieldLabel htmlFor="adminName">Admin Name</FieldLabel>
              <Input
                id="adminName"
                placeholder="John Doe"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="adminEmail">Admin Email *</FieldLabel>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@acmecorp.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="adminPassword">Admin Password *</FieldLabel>
              <Input
                id="adminPassword"
                type="password"
                placeholder="Min 8 characters"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </Field>
            <Button onClick={handleCreateTenant} disabled={isLoading || !tenantName || !adminEmail || !adminPassword}>
              {isLoading ? 'Creating...' : 'Create Tenant'}
            </Button>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                Tenant created successfully!
              </p>
              <div className="grid gap-2 text-sm">
                <div><span className="text-muted-foreground">Tenant ID:</span> <code>{createdTenant.id}</code></div>
                <div><span className="text-muted-foreground">Name:</span> {createdTenant.name}</div>
                {createdTenant.reference_id && (
                  <div><span className="text-muted-foreground">Reference ID:</span> {createdTenant.reference_id}</div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
              <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
                API Key (copy now — shown only once)
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-muted p-2 rounded break-all">
                  {createdTenant.api_key}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(createdTenant.api_key)}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            <Separator />

            <DomainWhitelistStep server={server} />

            <Separator />

            <p className="text-sm text-muted-foreground">
              Use the tenant API key in the "Player" screen to test creating KYC profiles under this tenant.
            </p>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setCreatedTenant(null)
                setTenantName('')
                setReferenceId('')
                setDescription('')
              }}>
                Create Another
              </Button>
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  Back to Home
                </Button>
              )}
            </div>
          </div>
        )}

        {!createdTenant && (
          <Button variant="ghost" onClick={onBack}>Back</Button>
        )}
      </FieldGroup>
    </FieldSet>
  )
}

function PlayerScreen({
  server,
  setServer,
  onBack,
}: {
  server: string
  setServer: (s: string) => void
  onBack?: () => void
}) {
  const [tenantApiKey, setTenantApiKey] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [userID, setUserID] = useState('')
  const [balance] = useState('10,000.00')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [securityLevel, setSecurityLevel] = useState('mid')
  const [country, setCountry] = useState('')
  const [language, setLanguage] = useState('')

  const handleLogin = () => {
    if (!tenantApiKey) {
      toast.warning('Enter your tenant API key')
      return
    }
    if (!userName || !userID) {
      toast.warning('Enter user name and ID')
      return
    }
    setIsLoggedIn(true)
    toast.success(`Welcome, ${userName}!`)
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.warning('Enter a valid withdrawal amount')
      return
    }

    setIsLoading(true)
    toast.info('KYC verification required for withdrawal. Redirecting...')

    try {
      const payload: any = {
        userID,
        name: userName,
        securityLevel,
      }
      if (country) payload.country = country
      if (language) payload.language = language

      const response = await fetch(`https://${server}/api/profiles/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': tenantApiKey,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.id && data.url) {
        toast.success('KYC profile created! Redirecting to verification...')
        setTimeout(() => {
          window.location.href = data.url
        }, 1500)
      } else {
        throw new Error('Failed to create KYC profile')
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <FieldSet>
        <FieldLegend>Tenant: User Login</FieldLegend>
        <FieldDescription>
          Simulate a tenant app. Enter the tenant API key and user details to "log in".
        </FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="server">API Server</FieldLabel>
            <Input
              id="server"
              value={server}
              onChange={(e) => setServer(e.target.value)}
            />
          </Field>
          <Separator />
          <Field>
            <FieldLabel htmlFor="tenantKey">Tenant API Key *</FieldLabel>
            <Input
              id="tenantKey"
              type="password"
              placeholder="Paste the API key from tenant onboarding"
              value={tenantApiKey}
              onChange={(e) => setTenantApiKey(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="userName">User Name *</FieldLabel>
              <Input
                id="userName"
                placeholder="John Doe"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="userID">User ID *</FieldLabel>
              <Input
                id="userID"
                placeholder="user_123"
                value={userID}
                onChange={(e) => setUserID(e.target.value)}
              />
            </Field>
          </div>
          <Button onClick={handleLogin} disabled={!tenantApiKey || !userName || !userID}>
            Log In
          </Button>
          <Button variant="ghost" onClick={onBack}>Back</Button>
        </FieldGroup>
      </FieldSet>
    )
  }

  return (
    <FieldSet>
      <FieldLegend>Wallet Dashboard</FieldLegend>
      <FieldDescription>
        Welcome, {userName}! Your balance is <strong>${balance}</strong>.
      </FieldDescription>
      <FieldGroup>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-sm text-muted-foreground">Available Balance</p>
          <p className="text-3xl font-bold mt-1">${balance}</p>
        </div>

        <Separator />

        <p className="text-sm font-medium">Withdraw Funds</p>
        <p className="text-sm text-muted-foreground">
          A withdrawal will trigger KYC identity verification.
        </p>

        <Field>
          <FieldLabel htmlFor="amount">Withdrawal Amount (USD)</FieldLabel>
          <Input
            id="amount"
            type="number"
            placeholder="1000.00"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field>
            <FieldLabel htmlFor="security">Security Level</FieldLabel>
            <Select value={securityLevel} onValueChange={setSecurityLevel}>
              <SelectTrigger id="security">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="mid">Mid</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="country">Country</FieldLabel>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALAYSIA">Malaysia</SelectItem>
                <SelectItem value="THAILAND">Thailand</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="language">Language</FieldLabel>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="th">Thai</SelectItem>
                <SelectItem value="zh-CN">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Button
          onClick={handleWithdraw}
          disabled={isLoading || !withdrawAmount}
          className="w-full"
        >
          {isLoading ? 'Processing...' : `Withdraw $${withdrawAmount || '0.00'}`}
        </Button>

        <Separator />

        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setIsLoggedIn(false)}>
            Log Out
          </Button>
          <Button variant="ghost" onClick={onBack}>
            Back to Home
          </Button>
        </div>
      </FieldGroup>
    </FieldSet>
  )
}

function TenantAdminScreen({
  server,
  setServer,
  onBack,
}: {
  server: string
  setServer: (s: string) => void
  onBack?: () => void
}) {
  const [tenantApiKey, setTenantApiKey] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  const handleConnect = () => {
    if (!tenantApiKey) {
      toast.warning('Enter your tenant API key')
      return
    }
    setIsConnected(true)
    toast.success('Connected to tenant dashboard')
  }

  if (!isConnected) {
    return (
      <FieldSet>
        <FieldLegend>Tenant Admin: Login</FieldLegend>
        <FieldDescription>
          Enter your tenant API key to view KYC verification statuses.
        </FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="server">API Server</FieldLabel>
            <Input id="server" value={server} onChange={(e) => setServer(e.target.value)} />
          </Field>
          <Separator />
          <Field>
            <FieldLabel htmlFor="adminKey">Tenant API Key *</FieldLabel>
            <Input
              id="adminKey"
              type="password"
              placeholder="Paste your tenant API key"
              value={tenantApiKey}
              onChange={(e) => setTenantApiKey(e.target.value)}
            />
          </Field>
          <Button onClick={handleConnect} disabled={!tenantApiKey}>
            Connect
          </Button>
          {onBack && <Button variant="ghost" onClick={onBack}>Back</Button>}
        </FieldGroup>
      </FieldSet>
    )
  }

  return (
    <FieldSet>
      <FieldLegend>Step 4: Admin Review</FieldLegend>
      <FieldDescription>
        Review KYC verification profiles and approve or reject them.
      </FieldDescription>
      <FieldGroup>
        <div className="rounded-lg border p-4">
          <p className="text-sm font-semibold mb-2">Connected</p>
          <p className="text-xs text-muted-foreground break-all">
            API Key: {tenantApiKey.substring(0, 8)}...{tenantApiKey.substring(tenantApiKey.length - 4)}
          </p>
        </div>

        <Separator />

        <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
            Admin Portal
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            For full profile management, approvals, and rejections, use the VanguardKYC Admin Portal:
          </p>
          <Button
            variant="outline"
            onClick={() => window.open('https://admin.vanguardkyc.online', '_blank')}
          >
            Open Admin Portal
          </Button>
        </div>

        <Separator />

        <p className="text-sm font-medium">Quick Profile Lookup</p>
        <ProfileLookup server={server} apiKey={tenantApiKey} />

        <Separator />
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setIsConnected(false)}>Disconnect</Button>
          {onBack && <Button variant="ghost" onClick={onBack}>Back to Home</Button>}
        </div>
      </FieldGroup>
    </FieldSet>
  )
}

function DomainWhitelistStep({ server }: { server: string }) {
  const [domain, setDomain] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAdd = async () => {
    let d = domain.trim()
    if (!d) {
      toast.warning('Enter a domain')
      return
    }
    if (!MASTER_API_KEY) {
      toast.error('Master API key not configured')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`https://${server}/api/domains`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': MASTER_API_KEY,
        },
        body: JSON.stringify({ domain: d, notes: notes.trim() || undefined }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || `HTTP ${response.status}`)
      }

      toast.success(`Domain ${d} added to whitelist`)
      setAdded(true)
    } catch (error) {
      toast.error(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">Step 2: Add Tenant's Domain to Whitelist</p>
      <p className="text-sm text-muted-foreground">
        Add the tenant's website domain so it can make API requests (CORS). Use *.example.com for all subdomains.
      </p>
      {!added ? (
        <>
          <div className="flex gap-2">
            <Input
              placeholder="*.example.com or https://app.example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={isLoading || !domain.trim()}>
              {isLoading ? '...' : 'Add'}
            </Button>
          </div>
          <Input
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-sm"
          />
        </>
      ) : (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3">
          <p className="text-sm text-green-600 dark:text-green-400">
            Domain added to whitelist. CORS will allow requests from this origin within 5 minutes.
          </p>
        </div>
      )}
    </div>
  )
}

function ProfileLookup({ server, apiKey }: { server: string; apiKey: string }) {
  const [profileId, setProfileId] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLookup = async () => {
    if (!profileId) {
      toast.warning('Enter a profile ID')
      return
    }
    setIsLoading(true)
    setProfile(null)
    try {
      const response = await fetch(`https://${server}/api/profiles/${profileId}`, {
        headers: {
          'x-api-key': apiKey,
          'Accept': 'application/json',
        },
      })

      if (response.status === 404) {
        toast.error('Profile not found (or belongs to a different tenant)')
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setProfile(data.data || data)
      toast.success('Profile found')
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          placeholder="Enter profile ID"
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleLookup} disabled={isLoading || !profileId}>
          {isLoading ? '...' : 'Lookup'}
        </Button>
      </div>
      {profile && (
        <div className="rounded-lg border p-4 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-muted-foreground">Name:</span> {profile.name || '—'}</div>
            <div><span className="text-muted-foreground">Status:</span>{' '}
              <span className={
                profile.verification_status === 'verified' ? 'text-green-600 font-semibold' :
                profile.verification_status === 'rejected' ? 'text-red-600 font-semibold' :
                'text-yellow-600 font-semibold'
              }>
                {profile.status || profile.verification_status || 'pending'}
              </span>
            </div>
            <div><span className="text-muted-foreground">Country:</span> {profile.country || '—'}</div>
            <div><span className="text-muted-foreground">Security:</span> {profile.security_level || '—'}</div>
            <div><span className="text-muted-foreground">Document:</span> {profile.document_type || '—'}</div>
            <div><span className="text-muted-foreground">Created:</span> {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

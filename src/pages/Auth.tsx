
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Phone, ArrowRight, Globe, Key, Smartphone } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import CountryCodeSelect from '@/components/CountryCodeSelect';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const phoneSignInSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const phoneVerifySchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  code: z.string().length(6, "Verification code must be 6 digits"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export default function Auth() {
  const navigate = useNavigate();
  const { 
    signIn, 
    signUp, 
    signInWithGoogle, 
    signInWithPhone, 
    verifyPhoneCode, 
    signUpWithPhone,
    signInWithPhonePassword,
    loading 
  } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isPhonePasswordOpen, setIsPhonePasswordOpen] = useState(false);
  const [isPhoneSignUpOpen, setIsPhoneSignUpOpen] = useState(false);
  
  const [verificationCode, setVerificationCode] = useState('');
  const [currentPhone, setCurrentPhone] = useState('');
  const [phonePassword, setPhonePassword] = useState('');

  // Forms
  const phoneSignInForm = useForm<z.infer<typeof phoneSignInSchema>>({
    resolver: zodResolver(phoneSignInSchema),
    defaultValues: {
      phone: '',
      password: ''
    }
  });

  const phoneVerifyForm = useForm<z.infer<typeof phoneVerifySchema>>({
    resolver: zodResolver(phoneVerifySchema),
    defaultValues: {
      phone: '',
      code: '',
      password: ''
    }
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during sign in');
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await signUp(email, password);
      // Stay on page for confirmation message
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during sign up');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    
    try {
      await signInWithGoogle();
      // Redirect happens automatically
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred with Google sign in');
      }
    }
  };

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Combine country code and phone number
    const fullPhoneNumber = countryCode + phoneNumber.replace(/^0+/, '');
    
    try {
      await signInWithPhone(fullPhoneNumber);
      setCurrentPhone(fullPhoneNumber);
      setIsPhoneDialogOpen(false);
      setIsVerificationOpen(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred with phone sign in');
      }
    }
  };

  const handleVerifyCode = async () => {
    setError(null);
    
    try {
      await verifyPhoneCode(currentPhone, verificationCode);
      setIsVerificationOpen(false);
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during verification');
      }
    }
  };

  // Handle phone password sign in
  const handlePhonePasswordSignIn = async (values: z.infer<typeof phoneSignInSchema>) => {
    setError(null);
    
    // Combine country code and phone number
    const fullPhoneNumber = countryCode + values.phone.replace(/^0+/, '');
    
    try {
      await signInWithPhonePassword(fullPhoneNumber, values.password);
      setIsPhonePasswordOpen(false);
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during sign in');
      }
    }
  };

  // Handle phone verification and sign up with password
  const handlePhoneSignUp = async (values: z.infer<typeof phoneVerifySchema>) => {
    setError(null);
    
    // Combine country code and phone number
    const fullPhoneNumber = countryCode + values.phone.replace(/^0+/, '');
    
    try {
      await signUpWithPhone(fullPhoneNumber, values.password, values.code);
      setIsPhoneSignUpOpen(false);
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during sign up');
      }
    }
  };

  // Handle initial phone verification for sign up
  const handleStartPhoneSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Combine country code and phone number
    const fullPhoneNumber = countryCode + phoneNumber.replace(/^0+/, '');
    
    try {
      await signInWithPhone(fullPhoneNumber);
      setCurrentPhone(fullPhoneNumber);
      phoneVerifyForm.setValue('phone', fullPhoneNumber);
      setIsPhoneDialogOpen(false);
      setIsPhoneSignUpOpen(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred with phone verification');
      }
    }
  };

  // Show phone password sign in dialog
  const showPhonePasswordSignIn = () => {
    phoneSignInForm.reset();
    setIsPhonePasswordOpen(true);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Workout Planner</CardTitle>
          <CardDescription>
            Sign in or create an account to manage your workouts
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted-foreground/30"></span>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="flex items-center justify-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    Google
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsPhoneDialogOpen(true)}
                    disabled={loading}
                    className="flex items-center justify-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Phone OTP
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={showPhonePasswordSignIn}
                    disabled={loading}
                    className="flex items-center justify-center gap-2"
                  >
                    <Key className="h-4 w-4" />
                    Phone+Pass
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted-foreground/30"></span>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="flex items-center justify-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    Google
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleStartPhoneSignUp}
                    disabled={loading}
                    className="flex items-center justify-center gap-2"
                  >
                    <Smartphone className="h-4 w-4" />
                    Phone
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
      
      {/* Phone OTP Dialog */}
      <Dialog open={isPhoneDialogOpen} onOpenChange={setIsPhoneDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in with phone number</DialogTitle>
            <DialogDescription>
              Enter your phone number to receive a verification code.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePhoneSignIn}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <CountryCodeSelect 
                    value={countryCode}
                    onChange={setCountryCode}
                  />
                  <Input
                    id="phone"
                    placeholder="123456789"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">Enter your phone number without any dashes or spaces</p>
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Code'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Verification Code Dialog */}
      <Dialog open={isVerificationOpen} onOpenChange={setIsVerificationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter verification code</DialogTitle>
            <DialogDescription>
              We've sent a code to {currentPhone}. Please enter it below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <InputOTP
              maxLength={6}
              value={verificationCode}
              onChange={setVerificationCode}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button 
              onClick={handleVerifyCode} 
              disabled={loading || verificationCode.length < 6}
              className="w-full"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Phone + Password Sign In Dialog */}
      <Dialog open={isPhonePasswordOpen} onOpenChange={setIsPhonePasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in with phone and password</DialogTitle>
            <DialogDescription>
              Enter your phone number and password to sign in.
            </DialogDescription>
          </DialogHeader>
          <Form {...phoneSignInForm}>
            <form onSubmit={phoneSignInForm.handleSubmit(handlePhonePasswordSignIn)} className="space-y-4">
              <div className="space-y-4">
                <FormField
                  control={phoneSignInForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <div className="flex gap-2">
                        <CountryCodeSelect 
                          value={countryCode}
                          onChange={setCountryCode}
                        />
                        <FormControl>
                          <Input 
                            placeholder="123456789" 
                            {...field} 
                            className="flex-1" 
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={phoneSignInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Your password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {error && <p className="text-destructive text-sm">{error}</p>}
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Phone Sign Up Dialog */}
      <Dialog open={isPhoneSignUpOpen} onOpenChange={setIsPhoneSignUpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete your phone registration</DialogTitle>
            <DialogDescription>
              Enter the verification code sent to your phone and create a password.
            </DialogDescription>
          </DialogHeader>
          <Form {...phoneVerifyForm}>
            <form onSubmit={phoneVerifyForm.handleSubmit(handlePhoneSignUp)} className="space-y-4">
              <FormField
                control={phoneVerifyForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={phoneVerifyForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Create Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Choose a password" 
                        {...field} 
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {error && <p className="text-destructive text-sm">{error}</p>}
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Creating Account...' : 'Complete Sign Up'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

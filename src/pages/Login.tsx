/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Building2, Lock, Mail, EyeIcon, EyeOffIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/');
    } catch (error) {
      toast({
        title: "Authentication error",
        description: "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-typold">
      {/* Left Panel - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-obsessedgrey p-8 flex-col justify-between relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://century21.tn/wp-content/uploads/CRE-A-19-11161542_BuyerSeller_Closing-Box-1.webp" 
            alt="Century 21 Real Estate" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-obsessedgrey/70"></div>
        </div>
        
        {/* Content - with z-index to appear above the background */}
        <div className="z-10 flex items-center gap-3">
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Century_21_seal_2018.svg" className="w-16"></img>
          {/* <Building2 className="h-10 w-10 text-white" /> */}
          {/* <span className="text-2xl font-bold text-white">CENTURY 21</span> */}
        </div>
        
        <div className="z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white">Welcome to the Franchise Management Portal</h1>
          <p className="text-xl text-white/80">
            Access your franchise dashboard, manage properties, and track performance in one place.
          </p>
        </div>
        
        <div className="z-10 text-white/60 text-sm">
          © 2025 Logis Technologies. All rights reserved.
        </div>
      </div>
      
      {/* Right Panel - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo (only visible on mobile) */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <Building2 className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-semibold">CENTURY 21</h2>
          </div>
          
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access your account
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember-me" 
                      checked={rememberMe}
                      onCheckedChange={() => setRememberMe(!rememberMe)}
                    />
                    <label 
                      htmlFor="remember-me" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </label>
                  </div>
                  
                  <a 
                    href="#" 
                    className="text-sm font-medium text-primary hover:underline"
                    onClick={(e) => e.preventDefault()}
                  >
                    Forgot password?
                  </a>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </CardContent>
            
            <Separator className="my-4" />
            
            <CardFooter className="flex flex-col space-y-2 pt-0">
              <p className="text-sm text-center text-muted-foreground">
                Having trouble logging in? Contact
                <a href="#" className="text-primary hover:underline ml-1">
                  support@century21.com
                </a>
              </p>
            </CardFooter>
          </Card>
          
          <p className="mt-8 text-center text-sm text-muted-foreground md:hidden">
            © 2025 CENTURY 21 Real Estate LLC. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
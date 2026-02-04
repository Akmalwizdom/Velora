import { Form, Head } from '@inertiajs/react';
import { Mail, Shield, User, Calendar } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

interface Props {
    invitation: {
        email: string;
        role: string;
        inviter: string;
        expires_at: string;
    };
    token: string;
}

export default function AcceptInvitation({ invitation, token }: Props) {
    return (
        <AuthLayout
            title="Welcome to Velora"
            description="Complete your account setup to get started"
        >
            <Head title="Accept Invitation" />

            {/* Invitation Context Banner */}
            <div className="mb-6 rounded-lg border border-border bg-muted/50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>You've been invited to join Velora</span>
                </div>
                
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="font-medium text-foreground">{invitation.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Invited by <span className="font-medium text-foreground">{invitation.inviter}</span></span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        <span>Role: <span className="font-medium text-foreground">{invitation.role}</span></span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Expires: <span className="font-medium text-foreground">{invitation.expires_at}</span></span>
                    </div>
                </div>
            </div>

            {/* Account Setup Form */}
            <Form
                action={`/invitation/${token}/accept`}
                method="post"
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    placeholder="Enter your full name"
                                    aria-describedby={errors.name ? 'name-error' : undefined}
                                />
                                <InputError message={errors.name} id="name-error" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="new-password"
                                    placeholder="Create a secure password"
                                    aria-describedby={errors.password ? 'password-error' : undefined}
                                />
                                <InputError message={errors.password} id="password-error" />
                                <p className="text-xs text-muted-foreground">
                                    Must be at least 8 characters
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    placeholder="Confirm your password"
                                    aria-describedby={errors.password_confirmation ? 'password-confirmation-error' : undefined}
                                />
                                <InputError message={errors.password_confirmation} id="password-confirmation-error" />
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="accept-invitation-button"
                            >
                                {processing && <Spinner />}
                                Activate Account
                            </Button>
                        </div>

                        <p className="text-center text-xs text-muted-foreground">
                            By activating your account, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}

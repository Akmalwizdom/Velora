import { Head } from '@inertiajs/react';
import { Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { router } from '@inertiajs/react';

export default function PendingApproval() {
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <AuthLayout
            title="Account Pending Approval"
            description="Your registration is being reviewed"
        >
            <Head title="Pending Approval" />

            <div className="text-center space-y-6">
                {/* Icon */}
                <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-yellow-500" />
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-foreground">
                        Almost there!
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Your account has been created successfully. 
                        An administrator will review and approve your registration shortly.
                    </p>
                </div>

                {/* Info Box */}
                <div className="bg-muted/50 rounded-lg p-4 text-left">
                    <h3 className="text-sm font-medium text-foreground mb-2">What happens next?</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• An admin will review your registration</li>
                        <li>• You'll receive an email once approved</li>
                        <li>• Then you can log in to access the dashboard</li>
                    </ul>
                </div>

                {/* Logout Button */}
                <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="w-full gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    Sign out
                </Button>
            </div>
        </AuthLayout>
    );
}

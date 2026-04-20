import { ReactNode, useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  LogOut,
  LayoutDashboard,
  FileText,
  ClipboardList,
  CheckSquare,
  Settings,
  Upload,
  Trash2,
  User,
  BarChart,
  Bell,
  CreditCard
} from 'lucide-react';
import { AppModal } from './ui/app-modal';
import { Button } from './ui/button';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarGroup,
  SidebarGroupContent,
  SidebarSeparator
} from './ui/sidebar';

interface DashboardLayoutProps {
  currentUser: any;
  onLogout: () => void;
  children: ReactNode;
  role: 'employee' | 'admin' | 'hr' | 'chief' | 'penr';
  activeTab: string;
  onTabChange: (tab: string) => void;
  headerColor: string;
  roleLabel: string;
  notificationCount?: number;
}

const menuItems = {
  employee: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'apply', label: 'Apply for Leave', icon: FileText },
    { id: 'applications', label: 'My Applications', icon: ClipboardList },
    { id: 'leave-card', label: 'Leave Card', icon: CreditCard },
    { id: 'signature', label: 'My Signature', icon: User }
  ],
  hr: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pending', label: 'Pending Review', icon: ClipboardList },
    { id: 'all', label: 'All Applications', icon: FileText },
    { id: 'employee_records', label: 'Employee Records', icon: User },
    { id: 'reports', label: 'Reports', icon: BarChart },
    { id: 'signature', label: 'My Signature', icon: User }
  ],
  admin: [
    { id: 'user_management', label: 'User Management', icon: Settings }
  ],
  chief: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pending', label: 'Pending Recommendation', icon: ClipboardList },
    { id: 'all', label: 'All Applications', icon: FileText },
    { id: 'signature', label: 'My Signature', icon: User }
  ],
  penr: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pending', label: 'Pending Approval', icon: ClipboardList },
    { id: 'all', label: 'All Applications', icon: FileText },
    { id: 'signature', label: 'My Signature', icon: User }
  ]
};

export function DashboardLayout({
  currentUser,
  onLogout,
  children,
  role,
  activeTab,
  onTabChange,
  headerColor,
  roleLabel,
  notificationCount = 0
}: DashboardLayoutProps) {
  const [showSignatureUpload, setShowSignatureUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const signature = reader.result as string;
        localStorage.setItem(`signature_${currentUser.id}`, signature);
        currentUser.signature = signature;
        setShowSignatureUpload(false);
        window.location.reload(); // Refresh to update signature display
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveSignature = () => {
    localStorage.removeItem(`signature_${currentUser.id}`);
    currentUser.signature = null;
    setShowSignatureUpload(false);
    window.location.reload(); // Refresh to update signature display
  };

  const items = menuItems[role];
  const activeItem = items.find((item) => item.id === activeTab);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className={`${headerColor} p-2 rounded-lg`}>
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Leave System</h2>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          isActive={activeTab === item.id}
                          onClick={() => onTabChange(item.id)}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            {/* User Profile Section */}
            <SidebarGroup>
              <SidebarGroupContent className="p-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Logged in as</p>
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.position}</p>
                  {currentUser.signature && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-1">Signature</p>
                      <img
                        src={currentUser.signature}
                        alt="Signature"
                        className="h-12 border border-sidebar-border rounded bg-white p-1"
                      />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => setShowSignatureUpload(true)}
                  >
                    <Upload className="w-4 h-4" />
                    Manage Signature
                  </Button>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onLogout}>
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          {/* Header */}
          <header className={`${headerColor} text-white shadow-md sticky top-0 z-10`}>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold">Leave Management System</h1>
                  <p className="text-sm opacity-90 mt-0.5">
                    Department of Environment and Natural Resources - PENR Zamboanga del Sur
                  </p>
                </div>
                {notificationCount > 0 && (
                  <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                    <Bell className="w-5 h-5 text-white" />
                    <div className="text-left">
                      <p className="text-xs opacity-90">Pending Actions</p>
                      <p className="text-lg font-bold">{notificationCount}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-background">
            <div className="mb-5">
              <p className="caption-text">{roleLabel} / {activeItem?.label ?? 'Overview'}</p>
              <h2 className="page-title">{activeItem?.label ?? 'Dashboard'}</h2>
            </div>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </main>
        </SidebarInset>
      </div>

      {/* Signature Upload Modal */}
      {showSignatureUpload && (
        <AppModal
          open={showSignatureUpload}
          onOpenChange={setShowSignatureUpload}
          title="Upload Signature"
          description="Used for leave forms and approvals."
          className="sm:max-w-md"
          footer={(
            <>
              {currentUser.signature ? (
                <Button type="button" variant="destructive" onClick={handleRemoveSignature}>
                  <Trash2 className="w-4 h-4" />
                  Remove
                </Button>
              ) : null}
              <Button type="button" variant="secondary" onClick={() => setShowSignatureUpload(false)}>
                Close
              </Button>
            </>
          )}
        >
          {currentUser.signature && (
            <div className="mb-4 rounded-lg border border-border bg-muted p-4">
              <p className="mb-2 text-sm text-muted-foreground">Current Signature:</p>
              <img
                src={currentUser.signature}
                alt="Current Signature"
                className="h-20 rounded border border-border bg-background p-2"
              />
            </div>
          )}

          <div className="mb-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleSignatureUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-md border-2 border-dashed border-border px-4 py-4 text-center app-transition hover:border-primary"
            >
              <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-foreground">Click to upload signature image</p>
              <p className="caption-text mt-1">PNG or JPG up to 2MB</p>
            </button>
          </div>
        </AppModal>
      )}
    </SidebarProvider>
  );
}

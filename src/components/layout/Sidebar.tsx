
import React from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import {
  Home,
  LayoutDashboard,
  ListChecks,
  Settings,
  User2,
  Plus,
  DollarSign
} from "lucide-react"
import { useLibrary } from "@/contexts/LibraryContext"

export function Sidebar() {
  const { user, signOut } = useAuth()
  const library = useLibrary()

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      disabled: false
    },
    {
      name: 'Home',
      href: '/',
      icon: Home,
      disabled: false
    },
    {
      name: 'Workout List',
      href: '/sheets',
      icon: ListChecks,
      disabled: false
    },
    {
      name: 'Create New',
      href: '/new',
      icon: Plus,
      disabled: false
    },
    {
      name: 'Sales Dashboard',
      href: '/sales',
      icon: DollarSign,
      disabled: false
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <LayoutDashboard className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-60 dark:border-border bg-secondary dark:bg-secondary flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navigate your account.
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="flex-1">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="profile">
              <AccordionTrigger className="data-[state=open]:text-foreground">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>{user?.user_metadata?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{user?.user_metadata?.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4">
                  <Link to="/account" className="flex items-center space-x-2">
                    <User2 className="h-4 w-4" />
                    <span>Account</span>
                  </Link>
                  <Link to="/settings" className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <Button variant="ghost" className="justify-start" onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Separator className="my-4" />
          <div className="grid gap-2">
            {navigationItems.map((item) => (
              <Link to={item.href} key={item.name} className="flex items-center space-x-2">
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
          {library?.collections && library.collections.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="grid gap-2">
                <h4 className="font-medium">Collections</h4>
                {library.collections.map((collection) => (
                  <Link to={`/collection/${collection.id}`} key={collection.id} className="flex items-center space-x-2">
                    <span>{collection.name}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

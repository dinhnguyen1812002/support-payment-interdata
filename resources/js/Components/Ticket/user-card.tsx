import React from 'react';
import { Button } from '@/Components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { User as UserIcon, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

interface UserCardProps {
  id: number;
  name: string;
  email: string;
}

export default function UserCard({ id, name, email }: UserCardProps) {
  const nameParts = name?.split(' ') || ['U'];
  const initials =
    nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : nameParts[0][0] || 'U';

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2" />

      <CardContent>
        <div className="flex items-start gap-4">
          {/* Avatar bên trái */}
          <Avatar className="h-20 w-20 rounded-lg">
            <AvatarImage
              src={`https://ui-avatars.com/api/?name=${encodeURI(name)}&color=7F9CF5&background=EBF4FF`}
              alt={`${name}'s photo`}
            />
            <AvatarFallback className="bg-primary/20 text-primary text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Thông tin bên phải */}
          <div className="flex flex-col justify-center space-y-3 w-full">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <Label className="flex justify-between w-full">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{name}</span>
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label className="flex justify-between w-full">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{email}</span>
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <Label className="flex justify-between w-full">
                <span className="text-muted-foreground">Employee ID:</span>
                <span className="font-medium">{id}</span>
              </Label>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline">Edit</Button>
        <Button variant="destructive">Remove</Button>
      </CardFooter>
    </Card>
  );
}

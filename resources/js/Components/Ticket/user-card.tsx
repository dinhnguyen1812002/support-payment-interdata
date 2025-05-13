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
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  UserRoundMinus,
  Pencil,
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface UserCardProps {
  id: number;
  name: string;
  email: string;
  roles: string;
  profile_photo_path?: string;
  departmentId: string;
}

export default function UserCard({
  id,
  name,
  email,
  roles,
  profile_photo_path,
  departmentId,
}: UserCardProps) {
  const nameParts = name?.split(' ') || ['U'];
  const initials =
    nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : nameParts[0][0] || 'U';

  const handleRemoveUser = () => {
    if (
      confirm(`Are you sure you want to remove ${name} from this department?`)
    ) {
      router.delete(
        route('departments.removeUser', { department: departmentId, user: id }),
        {
          onSuccess: () => {
            // Success notification is handled by the redirect in the controller
          },
        },
      );
    }
  };

  return (
    <Card className="@container/card">
      <CardHeader className="pb-2" />

      <CardContent>
        <div className="flex items-start gap-4">
          {/* Avatar bên trái */}
          <Avatar className="h-20 w-20 rounded-lg">
            <AvatarImage src={profile_photo_path} alt={`${name}'s photo`} />
            <AvatarFallback className="bg-primary/20 text-primary text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Thông tin bên phải */}
          <div className="flex flex-col justify-center space-y-3 w-full">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <Label className="flex w-full gap-x-1">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{name}</span>
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label className="flex w-full gap-x-1">
                <span className="text-muted-foreground">Email: </span>
                <span className="font-medium">{email}</span>
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <Label className="flex w-full gap-x-1">
                <span className="text-muted-foreground">Employee ID:</span>
                <span className="font-medium">{id}</span>
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <Label className="flex w-full gap-x-1">
                <span className="text-muted-foreground">roles:</span>
                <span className="font-medium">{roles}</span>
              </Label>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-x-1 border-t pt-4">
        <Button variant="outline">
          <Pencil />
        </Button>
        <Button variant="secondary" onClick={handleRemoveUser}>
          <UserRoundMinus />
        </Button>
      </CardFooter>
    </Card>
  );
}

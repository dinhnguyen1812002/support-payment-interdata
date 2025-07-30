'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { AvatarWithFallback } from '@/Components/ui/avatar-with-fallback';
import { Search, ChevronLeft, ChevronRight, Users, Filter } from 'lucide-react';
import { Inertia } from '@inertiajs/inertia';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

import React from 'react';

// interface Role {
//   key: string;
//   name: string;
//   permissions: string[];
//   description: string;
// }

interface  Role {
  key: string;
  name: string;
  permissions: string[];
  description: string;
}
interface User {
  id: number;
  name: string;
  email: string;
  profile_photo_path: string | undefined;
  created_at: string;
  roles: Role[];
}

interface Props {
  users?: {
      data: User[];
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
      next_page_url: string | null;
      prev_page_url: string | null;
  };
  keyword?: string;
  notifications?: any[];
}

export default function UsersTable({
  users,
  keyword = '',
  notifications = [],
}: Props) {
  const [search, setSearch] = useState(keyword);

  const handleSearch = () => {
    Inertia.get('/users', { search }, { preserveState: true });
  };

  if (!users || !users.data) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div className="text-muted-foreground">Đang tải dữ liệu người dùng...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleColor = (roleName: string) => {
    const roleColors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      editor: 'bg-blue-100 text-blue-800',
      user: 'bg-green-100 text-green-800',
      moderator: 'bg-purple-100 text-purple-800',
      guest: 'bg-gray-100 text-gray-800',
    };

    const lowerCaseName = roleName.toLowerCase();
    for (const [key, value] of Object.entries(roleColors)) {
      if (lowerCaseName.includes(key)) {
        return value;
      }
    }

    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="w-full shadow-sm border-none">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Quản lý người dùng
            </CardTitle>
            <CardDescription className="mt-1">
              Quản lý người dùng và vai trò của họ
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm người dùng..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="pl-8 pr-4"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Bộ lọc</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Tất cả người dùng</DropdownMenuItem>
                <DropdownMenuItem>Quản trị viên</DropdownMenuItem>
                <DropdownMenuItem>Biên tập viên</DropdownMenuItem>
                <DropdownMenuItem>Người dùng</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[80px]"></TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead className="hidden md:table-cell">
                  Ngày tạo
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.data.length > 0 ? (
                users.data.map(user => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      {/* <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={user.profile_photo_path}
                          alt={user.name}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar> */}
                      {/* <AvatarWithFallback
                        src={user.profile_photo_path ? `/storage/${user.profile_photo_path}` : null}
                        name={user.name}
                        alt={user.name}
                        className="h-9 w-9"
                        variant="identicon"
                        square={true}
                      /> */}
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((role, index) => {
                            const roleName =
                              typeof role === 'string' ? role : role.name;
                            return (
                              <Badge
                                key={index}
                                variant="outline"
                                className={`${getRoleColor(roleName)} border-0 font-medium text-xs`}
                              >
                                {roleName}
                              </Badge>
                            );
                          })
                        ) : (
                          <span className="text-muted-foreground text-xs px-2 py-1 bg-muted rounded-full">
                            Không có vai trò
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {formatDate(user.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        Không tìm thấy người dùng phù hợp với tiêu chí của bạn.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => Inertia.get('/users')}
                        className="mt-2"
                      >
                        Đặt lại bộ lọc
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {users.data.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Select defaultValue={users.per_page.toString()}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">mỗi trang</span>
            </div>

            <div className="text-sm text-muted-foreground">
              Hiển thị{' '}
              <span className="font-medium">
                {(users.current_page - 1) * users.per_page + 1}
              </span>{' '}
              đến{' '}
              <span className="font-medium">
                {Math.min(users.current_page * users.per_page, users.total)}
              </span>{' '}
              trong tổng số <span className="font-medium">{users.total}</span> người dùng
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  users.prev_page_url && Inertia.get(users.prev_page_url)
                }
                disabled={!users.prev_page_url}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Trang trước</span>
              </Button>

              <span className="text-sm">
                Trang <span className="font-medium">{users.current_page}</span>{' '}
                trong tổng số <span className="font-medium">{users.last_page}</span>
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  users.next_page_url && Inertia.get(users.next_page_url)
                }
                disabled={!users.next_page_url}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Trang sau</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

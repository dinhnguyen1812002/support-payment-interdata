import { useForm } from '@inertiajs/react';
import classNames from 'classnames';
import React, { useRef, useState } from 'react';
import useRoute from '@/Hooks/useRoute';
import ActionMessage from '@/Components/ActionMessage';
import ActionSection from '@/Components/ActionSection';
import DialogModal from '@/Components/DialogModal';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import { Session } from '@/types';
import { Airplay, Smartphone } from 'lucide-react';

import { Button } from '@/Components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

interface Props {
  sessions: Session[];
}

export default function LogoutOtherBrowserSessions({ sessions }: Props) {
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const route = useRoute();
  const passwordRef = useRef<HTMLInputElement>(null);
  const form = useForm({
    password: '',
  });

  function confirmLogout() {
    setConfirmingLogout(true);

    setTimeout(() => passwordRef.current?.focus(), 250);
  }

  function logoutOtherBrowserSessions() {
    form.delete(route('other-browser-sessions.destroy'), {
      preserveScroll: true,
      onSuccess: () => closeModal(),
      onError: () => passwordRef.current?.focus(),
      onFinish: () => form.reset(),
    });
  }

  function closeModal() {
    setConfirmingLogout(false);

    form.reset();
  }

  return (
    <ActionSection
      title={'Browser Sessions'}
      description={
        'Manage and log out your active sessions on other browsers and devices.'
      }
    >
      <div className="max-w-xl text-sm text-gray-600 dark:text-gray-400">
        Nếu cần, bạn có thể đăng xuất khỏi tất cả các phiên trình duyệt khác của
        mình trên tất cả các thiết bị. Một số phiên gần đây của bạn được liệt kê
        bên dưới; tuy nhiên, danh sách này có thể không đầy đủ. Nếu bạn cảm thấy
        tài khoản của mình đã bị xâm phạm, bạn cũng nên cập nhật mật khẩu.
      </div>

      {/* <!-- Other Browser Sessions --> */}
      {sessions.length > 0 ? (
        <div className="mt-5 space-y-6">
          {sessions.map((session, i) => (
            <div className="flex items-center" key={i}>
              <div>
                {session.agent.is_desktop ? (
                  <Airplay className="w-8 h-8 text-gray-500" />
                ) : (
                  <Smartphone className="w-8 h-8 text-gray-500" />
                )}
              </div>

              <div className="ml-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {session.agent.platform} - {session.agent.browser}
                </div>

                <div>
                  <div className="text-xs text-gray-500">
                    {session.ip_address},
                    {session.is_current_device ? (
                      <span className="text-green-500 font-semibold">
                        This device
                      </span>
                    ) : (
                      <span>Last active {session.last_active}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* <div className="flex items-center mt-5">
        <PrimaryButton onClick={confirmLogout}>
        Đăng xuất khỏi các thiết bị khác
        </PrimaryButton>

        <ActionMessage on={form.recentlySuccessful} className="ml-3">
          Done.
        </ActionMessage>
      </div> */}

      {/* <!-- Log Out Other Devices Confirmation Modal --> */}
      {/* <DialogModal isOpen={confirmingLogout} onClose={closeModal}>
        <DialogModal.Content title={'Log Out Other Browser Sessions'}>
          Để xác nhận rằng bạn muốn đăng xuất khỏi các phiên trình 
          duyệt khác trên tất cả các thiết bị của mình, 
          vui lòng nhập mật khẩu của bạn.
          <div className="mt-4">
            <TextInput
              type="password"
              className="mt-1 block w-3/4"
              placeholder="Password"
              ref={passwordRef}
              value={form.data.password}
              onChange={e => form.setData('password', e.currentTarget.value)}
            />

            <InputError message={form.errors.password} className="mt-2" />
          </div>
        </DialogModal.Content>

        <DialogModal.Footer>
          <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>

          <PrimaryButton
            onClick={logoutOtherBrowserSessions}
            className={classNames('ml-2', { 'opacity-25': form.processing })}
            disabled={form.processing}
          >
            Đăng xuất khỏi các thiết bị khác
          </PrimaryButton>
        </DialogModal.Footer>
      </DialogModal>
     */}

      <div className="mt-5">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary"> Đăng xuất khỏi các thiết bị khác</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription>
                Để xác nhận rằng bạn muốn đăng xuất khỏi các phiên trình duyệt
                khác trên tất cả các thiết bị của mình, vui lòng nhập mật khẩu
                của bạn.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input
                  type="password"
                  className="mt-1 block w-3/4"
                  placeholder="Password"
                  ref={passwordRef}
                  value={form.data.password}
                  onChange={e =>
                    form.setData('password', e.currentTarget.value)
                  }
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-start">
              <Button variant={'destructive'}
               onClick={logoutOtherBrowserSessions}
                className={classNames('bg-red-600', { 'opacity-25': form.processing })}
                disabled={form.processing}
              >
                Đăng xuất khỏi các thiết bị khác
              </Button>
              <DialogClose asChild>
              {/* 
                <Button
                  type="button"
                  variant="secondary"
                  onClick={logoutOtherBrowserSessions}
                  className={classNames('ml-2', {
                    'opacity-25': form.processing,
                  })}
                  disabled={form.processing}
                >
                  Đóng
                </Button> */}
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ActionSection>
  );
}

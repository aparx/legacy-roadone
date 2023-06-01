import { Permission } from '@/modules/auth/utils/permission';
import { PublicUser } from '@/modules/schemas/user';
import { getGlobalMessage } from '@/utils/message';
import { Icon, PropsWithStyleable, Stack, useStyleableMerge } from 'next-ui';
import { forwardRef, HTMLAttributes } from 'react';
import { MdVerified } from 'react-icons/md';
import { ObjectConjunction } from 'shared-utils';

export type InternalUserFormatProps = {
  user: Partial<PublicUser> | undefined | null;
};

export type UserFormatProps = ObjectConjunction<
  PropsWithStyleable<HTMLAttributes<HTMLElement>>,
  InternalUserFormatProps
>;

export const Username = forwardRef<HTMLDivElement, UserFormatProps>(
  function UsernameRenderer(props, ref) {
    const { user, ...rest } = props;
    const restProps = useStyleableMerge(rest);
    return user == null ? (
      <div ref={ref} {...restProps}>
        [[deleted]]
      </div>
    ) : !user?.name && user.id ? (
      <div ref={ref} data-user-id={user.id} {...restProps}>
        Anonym
      </div>
    ) : (
      <Stack
        direction={'row'}
        ref={ref}
        vAlign
        spacing={0.25}
        {...restProps}
        data-user-id={user.id}
      >
        {user.name}
        {user.verified ||
          (user.role && Permission.isGreater(user.role, 'USER') && (
            <Icon
              sd={{ color: (t) => t.sys.color.scheme.primary }}
              aria-label={getGlobalMessage('translation.verifiedUser')}
              icon={<MdVerified style={{ fontSize: '120%' }} />}
            />
          ))}
      </Stack>
    );
  }
);

export default Username;

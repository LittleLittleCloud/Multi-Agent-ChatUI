import styled from '@emotion/styled';
import { Box, Stack } from '@mui/material';
import { FC } from 'react';

interface Props {
  size?: string;
  className?: string;
}

export const Spinner: FC<Props> = ({ size = '1em', className="" }) => {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`animate-spin ${className}`}
      height={size}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>
  );
};

export const ThreeDotBouncingLoader: FC<Props> = ({ size = '1em', className="" }) => {
  return (
    <Stack
      direction="row"
      spacing={0.5}>
      <BouncingLoader />
      <BouncingLoader style={{ animationDelay: '0.1s' }} />
      <BouncingLoader style={{ animationDelay: '0.2s' }} />
    </Stack>
  );
};

export const BouncingLoader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  animation: `bouncing-loader 0.5s infinite alternate`,
  backgroundColor: theme.palette.text.secondary,
  width: '0.5rem',
  height: '0.5rem',
  borderRadius: '50%',
  opacity: 1,
  '@keyframes bouncing-loader': {
    from: {
      opacity: 0.1,
      transform: 'translateY(0.2rem)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0.7rem)',
    }
  }
}));

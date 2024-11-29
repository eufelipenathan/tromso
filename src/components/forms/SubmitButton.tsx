import React from 'react';
import Button from '../Button';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loadingKey?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  children,
  loadingKey = 'form-submit',
  ...props
}) => {
  return (
    <Button
      type="submit"
      loadingKey={loadingKey}
      {...props}
    >
      {children}
    </Button>
  );
};

export default SubmitButton;
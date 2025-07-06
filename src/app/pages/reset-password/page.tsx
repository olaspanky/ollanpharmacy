import AuthForm from '../../components/Authform';

export default function ResetPassword() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      <AuthForm type="reset-password" />
    </div>
  );
}
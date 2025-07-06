import AuthForm from '../../components/Authform';

export default function Signup() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <AuthForm type="signup" />
    </div>
  );
}
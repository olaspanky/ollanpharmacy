import AuthForm from '../../components/Authform';

import Navbar from '../../components/Navbar';

export default function Signup() {
  return (
    <div className="">
      <Navbar/>
      <AuthForm type="signup" />
    </div>
  );
}
import LoginForm from "@/components/LoginForm";

const Login = () => {
  const handleLoginSuccess = () => {
    // Navigate to home page
    window.location.href = "/";
  };

  return <LoginForm onSuccess={handleLoginSuccess} />;
};

export default Login;
import { useAuthStore } from "../store/useAuthStore";

const HomePage = () => {
  const {user} = useAuthStore();
  console.log(user);
  return (
    <div>HomePage</div>
  )
}

export default HomePage
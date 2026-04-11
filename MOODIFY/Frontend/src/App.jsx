import { RouterProvider } from "react-router";
import { router } from "./app.routes";
import "./features/shared/styles/global.scss";
import { Authprovider } from "./features/auth/auth.context";
const App = () => {
  return (
    // <FaceExpression/>
    <Authprovider>
      <RouterProvider router={router} />
    </Authprovider>
  );
};

export default App;

import { RouterProvider } from "react-router";
import { router } from "./app.routes";
import "./features/shared/styles/global.scss";
import { Authprovider } from "./features/auth/auth.context";
import { SongContextProvider } from "./features/home/song.context";
const App = () => {
  return (
    // <FaceExpression/>
    <Authprovider>
      <SongContextProvider>
        <RouterProvider router={router} />
      </SongContextProvider>
    </Authprovider>
  );
};

export default App;

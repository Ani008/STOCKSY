import Colors from "./colors";
import Spacing from "./spacing";

const Layout = {
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.screen,
    paddingBottom: 100,
  },
};

export default Layout;
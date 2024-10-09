import { Provider } from 'react-redux';
import { store } from './store/store';
import MyLibrary from './components/MyLibrary';

const App = () => {
  return (
    <Provider store={store}>
      <MyLibrary />
    </Provider>
  );
};

export default App;
import until from 'async-until';
import { createContext } from '../../../utils/enzyme';
import fixture from '../__fixtures__/ready';

const postMessage = jest.fn();

const { mount, getRootWrapper, getRef } = createContext({
  fixture,
  async beforeInit() {
    await until(() => getRef().loaderFrame);
    getRef().loaderFrame = {
      contentWindow: {
        postMessage
      }
    };
  }
});

describe('CP wrong fixture select via router', () => {
  beforeEach(async () => {
    await mount();

    const { props } = fixture;
    getRootWrapper().setProps({
      fixture: {
        ...fixture,
        props: {
          ...props,
          component: 'ComponentB',
          fixture: 'quxx'
        }
      }
    });
  });

  test('sends fixture select message to loader', () => {
    expect(postMessage).not.toHaveBeenCalled();
  });
});

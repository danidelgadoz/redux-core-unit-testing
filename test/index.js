const assert = require('assert');

// your code goes here:
const createStore = (reducer, initialState) => {
  let state = initialState && JSON.parse(JSON.stringify(initialState));
  let mapSuscribeCallbacksFn = new Map();

  state = state ?? reducer(state, '');

  return {
    subscribe: (callbackFn) => {
      mapSuscribeCallbacksFn.set(callbackFn, callbackFn);

      return () => {
        mapSuscribeCallbacksFn.delete(callbackFn);
      };
    },
    dispatch: (action) => {
      const newState = reducer(state, action);
      state = newState;
      mapSuscribeCallbacksFn.forEach((s) => s(state));
    },
    getState: () => state,
  };
};

it('initializes reducer', () => {
  const initialState = { name: 'foo' };
  const reducer = (state = initialState, action) => {
    if (action.type !== 'SET_NAME') {
      return state;
    }
    return {
      ...state,
      name: action.payload,
    };
  };
  const store = createStore(reducer);
  assert(store.getState().name === 'foo');
});

it('can have multiple subscribers', () => {
  const store = createStore((state) => state, {});
  let callCount1 = 0;
  let callCount2 = 0;
  let callCount3 = 0;
  store.subscribe(() => {
    callCount1++;
  });
  const unsubscribe = store.subscribe(() => {
    callCount2++;
    unsubscribe();
  });
  store.subscribe(() => {
    callCount3++;
  });
  store.dispatch({ type: 'foo' });
  assert(callCount1 === 1);
  assert(callCount2 === 1);
  assert(callCount3 === 1);
  store.dispatch({ type: 'foo' });
  assert(callCount1 === 2);
  assert(callCount2 === 1);
  assert(callCount3 === 2);
});

it('can subscribe to state changes', () => {
  const reducer = (state, action) => {
    if (action.type !== 'SET_NAME') {
      return state;
    }
    return {
      ...state,
      name: action.payload,
    };
  };
  const initialState = { name: 'baz' };
  const store = createStore(reducer, initialState);

  let name = undefined;

  const subscriber = (state) => {
    name = state.name;
  };
  store.subscribe(subscriber);

  assert(typeof name === 'undefined');

  store.dispatch({ type: 'SET_NAME', payload: 'bar' });
  assert(store.getState().name === 'bar');
  assert(name === 'bar');

  store.dispatch({ type: 'SET_NAME', payload: 'baz' });
  assert(store.getState().name === 'baz');
  assert(name === 'baz');
});

it('can dispatch actions', () => {
  const reducer = (state, action) => {
    if (action.type !== 'SET_NAME') {
      return state;
    }
    return {
      ...state,
      name: action.payload,
    };
  };

  const initialState = {};
  const store = createStore(reducer, initialState);

  const action = { type: 'FOO', payload: 'bar' };
  store.dispatch(action);
  assert(store.getState().name === undefined);

  const action2 = { type: 'SET_NAME', payload: 'foo' };
  store.dispatch(action2);
  assert(store.getState().name === 'foo');
});

it('initializes with initial state', () => {
  const reducer = (state) => state;
  const initialState = { foo: true, bar: Math.random() };
  const store = createStore(reducer, initialState);

  const state = store.getState();
  assert(Object.keys(state).length === 2);
  assert(state.foo === true);
  assert(state.bar === initialState.bar);
});

it('can create a store', () => {
  const reducer = (state) => {
    return state;
  };
  const initialState = {};
  const store = createStore(reducer, initialState);

  assert(typeof store.subscribe === 'function');
  assert(typeof store.dispatch === 'function');
  assert(typeof store.getState === 'function');
});

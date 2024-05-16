# ⚛️ react-declarative

> Developer notes

## React: declarative vs imperative

> What is the declarative programming?

Declarative programming is when a more qualified specialist writing code in a way when its behavior can be changed by using external config which represent oriented graph of objects. For example, [Jetpack Compose](https://developer.android.com/jetpack/compose) or [Flutter Widgets](https://docs.flutter.dev/development/ui/widgets).

Legacy solutions had used an `xml-like markup languages` which represented ui object tree. For example, [XAML in WPF](https://learn.microsoft.com/en-us/dotnet/desktop/wpf/xaml) (see [FuncUI](https://funcui.avaloniaui.net/)) or [*.ui in Qt](https://doc.qt.io/qt-6/designer-using-a-ui-file.html). They still have internal object composition syntax (like [DOM API](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)) but it is highly recomended to use markup language to implement the UI in a declarative way.

After [Facebook introduced JSX](https://reactjs.org/docs/introducing-jsx.html) the whole enterprise migrated to web because it gives to developer more accessibility to design features and customize user experience by using `functional programming` (code significantly cheaper). In that case, `JSX` is declarative to `HTML` (more correct `DOM API` -> `HTML` -> `JSX`)

If you studied computer science you must know that everything in software [is built on top of abstractions](https://en.wikipedia.org/wiki/Architecture_of_macOS). For example in macOS `hardware` is used by `mach kernel`. `Mach kernel` is used by `Core OS`. `Core OS` is used by `QuckTime`. `QuickTime` is used by `GUI`. As you can see, [the subject of the relation](https://en.wikipedia.org/wiki/Subject_(philosophy)) is declarative to the object of the relationship

My idea is simple. If `C/C++ language` is declarative to `assembly`, `JavaScript` is declarative to `C++`, `React` is declarative to `JavaScript` why don't we build something which will reduce cost of app development when using React (`DOM API` -> `HTML` -> `Plain JS objects` -> `JSX`)?

As a result I had implemented a framework which can handle [the most usecases of the material guidelines](https://m2.material.io/components) usage with avalibility to fallback into vanilla JSX way of React development. That tool makes your code more functional because It removes the mostly used imperative parts of the virgin source code.

So this is definitely the next step on the direction based on top of historical evolution of the UI development way. The community has come up with a new term to define this phenomenon, It called [low code](https://en.wikipedia.org/wiki/Low-code_development_platform).

The `react-declarative` framework is the best low code solution because you still have `webpack`, `node_modules`, `package.json` and the full control on the source code.

In comparison with imperative programming in declarative programming we are not creating component instances manually by using [new operator](https://doc.qt.io/qt-6/qwidget.html#details) or similar (see [Dependency inversion principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)). The difference is in more [SOLID](https://en.wikipedia.org/wiki/SOLID) way when using declarative constructions instead of imperative code.

## Fractal pattern (fractal project structure)

> Fractal pattern conveys that similar patterns recur progressively and the same thought process is applied to the structuring of codebase i.e All units repeat themselves.

**Pros of fractal**

1. All pros of [Domain driven design](https://en.wikipedia.org/wiki/Domain-driven_design)

2. Easy migration to [Microfrontend](https://en.wikipedia.org/wiki/Microfrontend)

**Cons of fractal**

1. In Windows NT maximum path length is [260 symbols](https://learn.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation)

2. [CRA](https://create-react-app.dev/) works slower with fractal architecture (due to WebPack usage). When the bundle size increase we need to use [monorepo](https://github.com/nrwl/nx) with [module federation](https://webpack.js.org/concepts/module-federation/)

```text
├── src                       # Application source code
│   ├── components            # Reusable Presentational Components
│   ├── assets                # Required assets
│   ├── layouts               # Components that dictate major page structure
│   └── routes                # Main route definitions and async split points
│       ├── index.js          # Bootstrap main application routes with store
│       │
│       └── Route1
│       │    ├── index.js     # Route definitions and async split points
│       │    ├── components   # Presentational React Components
│       │    ├── assets       # Assets required to render components
│       │
│       └── Route2
│       │    ├── index.js     # Route definitions and async split points
│       │    ├── components   # Presentational React Components
│       │    ├── assets       # Assets required to render components
```

## SOLID in react-declarative

> SOLID principles described by simple words with examples in a source code

1. **[Single-responsibility principle](https://en.wikipedia.org/wiki/Single-responsibility_principle)**

    The [EventEmitter](./src/utils/rx/EventEmitter.ts) does only event broadcast. Subscription management and event filtering implemented in [Subject](./src/utils/rx/Subject.ts) and [Observer](./src/utils/rx/Observer.ts)

2. **[Open–closed principle](https://en.wikipedia.org/wiki/Open%E2%80%93closed_principle)**

    The latest value of [Subject](./src/utils/rx/Subject.ts) is stored in [BehaviorSubject](./src/utils/rx/BehaviorSubject.ts)

3. **[Liskov substitution principle](https://en.wikipedia.org/wiki/Liskov_substitution_principle)**

    The components props (for example, [IOneProps](./src/model/IOneProps.ts#26)) are using [TSubject](./src/model/TSubject.ts) instead of [Subject](./src/utils/rx/Subject.ts) so the developer can easy use [rxjs](https://rxjs.dev/) or similar implementation

4. **[Interface segregation principle](https://en.wikipedia.org/wiki/Interface_segregation_principle)**

    [BehaviorSubject](./src/utils/rx/BehaviorSubject.ts) extends [Subject](./src/utils/tx/Subject.ts), which using an [Observer](./src/utils/rx/Observer.ts). But if you check it's source code you will notice than it implements [TBehaviorSubject](./src/model/TBehaviorSubject.ts) and [TObservable](./src/model/TObserver.ts) both. This is posible due to the interfaces don't overlap each other

5. **[Dependency inversion principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)**

    When you are using [IField](./src/model/IField.ts) object tree provided to [<One />](./src/components/One/) props you are not making component instances manually. The declarative programming makes dependency inversion by itself. If the answer is not good enough, see [provide and inject](./src/helpers/serviceManager.ts) and [Angular2 dependency injection](https://angular.io/guide/dependency-injection)

## Product-oriented principles

> These principles will help you to keep the code as clean as possible when you need to make a [MVP](https://en.wikipedia.org/wiki/Minimum_viable_product) immediately

1. **Keep UI [Responsiveness](https://en.wikipedia.org/wiki/Responsiveness)**

    It easy enough to make UI [reactive for user action](https://en.wikipedia.org/wiki/Reactive_user_interface) while extended computer operation in progress if you use [FetchView](./src/components/FetchView), [ActionButton](./src/components/ActionButton) and intermediate progress bars.

2. **Don't overingeneer things**

    If you got a lack of time you should [keep it simple](https://en.wikipedia.org/wiki/KISS_principle). Use [Event-driven programming](https://en.wikipedia.org/wiki/Event-driven_programming) (see `Subject`, `Observer`), declarative state management (`FetchView`, `Async`, `One`, `useActionModal`) whenever it's possible

3. **Product first, infrastructure second**

    The `react-declarative` includes everything you need to build a [PWA](https://en.wikipedia.org/wiki/Progressive_web_app). Avoid [R&D](https://en.wikipedia.org/wiki/Research_and_development), it cost a lot. Use build-in components. If not good enough for a first look then overthink the layout, not a code

## Reduce algoritm difficulty when working with oriented graphs

> The real useful note for working with oriented graphs

Hey! If you need to implement context search in something with nested groups go check [src/components/RecordView/context/SearchContext](./src/components/RecordView/context/SearchContext/SearchContext.tsx).

There is a quite usefull [deepFlat](./src/components/RecordView/utils/deepFlat.ts) utils which helps to iterate oriented graph nodes with `O(N)` difficulty. As a first attempt, try It with [TDD](https://en.wikipedia.org/wiki/Test-driven_development).

FYN for experiments there is a [unit test with mock oriented graph](./src/utils/__tests__/deepFlat.test.ts)

## Using underected data flow for building software product line

> Useful snippets to split procedure code with the inversion of control pattern

As a capitalists we don't need to build solid things which work for decades. We need to build maintainable things which can be controlled by the power of a capital, what means industry.

So than you thinking about [strictly typed centralized state management](https://medium.com/webf/contemporary-front-end-architectures-fb5b500b0231) in your project you must known the payback. If this is one-time project, you wrong. I think any project since 201X is temporary thing for getting money

**MyForm/MyForm.fields.ts**
```tsx
import { IField, FieldType, Subject } from 'react-declarative';

export const groupFocusSubject = new Subject();

const fields: IField[] = [
    {
        type: FieldType.Group,
        focus: () => groupFocusSubject.next(),
        fields: [
            {
                type: FieldType.Text,
                name: 'firstName',
                title: 'First name',
            },
            {
                type: FieldType.Text,
                name: 'lastName',
                title: 'Last name',
            },
        ],
    },
];
```

Normally we are going to await for a group of fields focus event by using `onFocus` callback. But if this handler contains too many business logic we are going to apply `useCallback`. I think this is imperative way of solving problem. I found the better solution

**MyForm/MyForm.tsx**
```tsx
import { One, useSubscription } from 'react-declarative';

import { fields, groupFocusSubject } from './MyForm.fields';

export const MyForm = () => {

    useSubscription(groupFocusSubject, () => {
        // some view update
    });

    return (
        <One
            fields={fields}
            ...
        />
    );
}
```

This code do the same but It defenitely more extendable (declarative way). For example, we can split the single long procedure to multiple handlers placed in different hooks. I have seen the similar solution in some project with live previewed [AutoCAD 3D model](https://www.autodesk.co.uk/products/autocad-architecture)

**MyForm/MyForm.tsx**
```typescript
import { useSource, useSubscription } from 'react-declarative';

...

const 3dModelSource = useSource(
    groupFocusSubject.mapAsync(
        async (groupName: string) => await fetchRawData(groupName),
    )
);

useSubscription(3dModelSource, (data) => {
    displayBlueprintFrontView(data);
});

useSubscription(3dModelSource, (data) => {
    displayBlueprintTopView(data);
});

useSubscription(3dModelSource, (data) => {
    displayBlueprintSideView(data);
});
```

As you can see displaying the one of dimensions on a blueprint can be disabled [by a feature flag](https://en.wikipedia.org/wiki/Feature-oriented_programming). If you remember, thats the way of pushing updates to clients which Microsoft started to use since Windows 10. That paradign is better because It [turns the software design into manufacturing](https://en.wikipedia.org/wiki/Software_product_lines)

**MyForm/hooks/useSideViewHandler.ts**
```typescript
const useSideViewHandler = () => {

    ...

    useSubscription(3dModelSource, (data) => {
        if (hasPaymentForSideView) {
            displayBlueprintSideView(data);
        }
    }, [hasPaymentForSideView]);

    ...

};
```

This code split guide will free you from solving [Git Merge conflicts](https://www.atlassian.com/git/tutorials/using-branches/merge-conflicts) when you [start getting payed from customers by subscription model](https://en.wikipedia.org/wiki/Software_as_a_service)


```typescript
const [text, setText] = useState("");

const textChanged = useChangeSubject(text);

useSubscription(textChanged.debounce(), () => {
    // Easy money
});

...

```

P.S. Have you ever implemented state change debounce yet? :-)

## Frontend as a service bus for Service-Oriented Architecture (SOA)

If you're launching a tech startup, there's a high possibility that your company won't have a budget for DevOp, that means you need to find a way to scale the backend by yourself. The easiest solution is to use [serverless containers](https://github.com/open-runtimes/open-runtimes) like OpenRuntimes and a load balancer (NGINX).

A serverless container (function) is a chunk of code that starts, executes an action, and then destroys itself. This is the only way to guarantee the absence of memory leaks in the long term. Also, they can be scaled because they are stateless; you can just start another instance on a different port with NGINX upstream, and it will consume more resources. Additionally, that instance could be started on a different machine, so the data center can be scaled vertically.

The problem starts when you need to emit an event from one serverless container to another. This could be easily solved with [Inversion of Control (IoC)](./docs/code/DI.md) and [Subjects](./docs/code/RX.md). So, the `react-declarative` will help you build complex high-load systems with minimal resources for a coder's team.

## Make SPA Java again

The modern V8 engine made the true «~~compile~~ transpile once run anywhere». So, If we coding standalone app It pointless to use Java cause we don't 100% know how exactly It will work on modern ARM processors. The problem is in [the standart libraries](https://stackoverflow.com/a/693119/7388307) which connected to host operation system through native API. By the standart library I mean not the Java Core but the libs which we need to solve business problems like charts, grids etc. In javascript, the whole standart library is implemented by the browser

When Javascript introduce itself to the world as the performant language, the Facebook released. So after that nobody cared about software design, the user data collection race started. A data collection race made the chatgpt, a Microsoft product running on Azure cloud. There is an issue in computer science history which no one see, the data collection for neural networks is impossible without software infrastructure. For example, you can't build AI rieltor untill you got a CRM with apartments and rent/sell bids.

Right now CRM systems are not the main business product, so coding them must be cheap. So, the Firebase is actually not bad idea but It expensive. There are several production ready application services which can be easely used for data collection

1. **Appwrite** - [https://appwrite.io/](https://appwrite.io/)

    The first Firebase alternative which means the biggest community. You may google (~~chatgpt~~) the solution of any problem with high possibility 

2. **Pocketbase** - [https://pocketbase.io/](https://pocketbase.io/)

    Maintainability of SQLite (copy `data.db` to backup, edit it with [sqlitestudio](https://github.com/pawelsalawa/sqlitestudio) to troubleshoot) plus scalability of [Azure Cosmos DB](https://www.cdata.com/data/integration/cosmosdb-to-sqlite/) or [SQLiteCloud](https://sqlitecloud.io/) are the best for waterflow development

3. **Supabase** - [https://supabase.com/](https://supabase.com/)

    Blazing fast application server which uses Haskel (Postgrest) under the hood. Which cost `1Gb` of RAM in java cost `60Mb` in haskel

All of them supports Realtime event bus that means staring coding new app without them pointless: they scalable on backend, they performant on frontend. There is a problem of migrating from one to another. Each of framework connect itself to the frontend by using generated SDK. It's a JS class with static method each of them wrap `fetch` call.

The only way to allow fast migration from one application server to another is to write code in clean architecture with layer organising principles. You should split business logic from presentation and database. The `react-declarative` contains special code for implementation of these priciples called [DI](./docs/code/DI.md)

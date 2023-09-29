import { useReducer } from "react";

export function App() {
	const [_, forceUpdate] = useReducer(x => x + 1, 0);

	return (
		<div>
			<header className="py-6 bg-gunmetal-900">
				<h1 className="font-bold max-w-2xl m-auto">Headless Curling Timer</h1>
			</header>
			<main className="max-w-3xl p-8 m-auto bg-gunmetal-800">
				<p>There is no demo for this library.</p>
			</main>
			<footer className="py-6 bg-gunmetal-900 text-center">
				<p>
					View on <a href="https://github.com/T-Hugs/headless-curling-timer">GitHub</a> |{" "}
					<a href="https://npmjs.com/package/@trevorsg/headless-curling-timer">npm</a>
				</p>
				<p>Created by Trevor Gau</p>
			</footer>
		</div>
	);
}

export default App;

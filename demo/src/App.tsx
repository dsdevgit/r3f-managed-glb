import './App.css';

function App() {
  return (
    <div className="App">
      <Canvas
        camera={{
          near: 0.1,
          far: 1000,
          zoom: 1,
          position: [0, 0, 5]
        }}
      >
        <Cube />
        <ambientLight args={[0xffffff]} intensity={0.2} />
        <directionalLight position={[1, 1, 1]} intensity={0.8} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;

// Test script to verify API transformation
async function testWorldsAPI() {
  try {
    const res = await fetch('http://localhost:4000/api/v1/worlds');
    const data = await res.json();
    console.log('✅ API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Simulate transformation
    function transformWorldData(rawWorld) {
      const meta = rawWorld.meta || {};
      return {
        id: String(rawWorld.id),
        name: rawWorld.name,
        description: meta.description || `Experience ${rawWorld.name}`,
        color: meta.color || 'from-blue-400 to-purple-600',
        baseColor: '#1e293b',
        weather: meta.weather || 'clear',
        season: 'spring',
        icon: meta.icon || '🌍',
        levels: [],
        isLocked: false
      };
    }
    
    console.log('\n✅ Transformed Worlds:');
    const transformed = data.worlds.map(transformWorldData);
    console.log(JSON.stringify(transformed, null, 2));
    
    console.log('\n✅ Count:', transformed.length, 'worlds loaded');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testWorldsAPI();

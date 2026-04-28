const testMultitenant = async () => {
  const baseUrl = 'http://localhost:3000';
  const timestampA = Date.now() + 1;
  const timestampB = Date.now() + 2;

  console.log('=========================================');
  console.log(' Iniciando Teste de Isolamento Multi-tenant ');
  console.log('=========================================\n');

  try {
    // --- USUÁRIO A ---
    console.log('--- Fluxo Usuário A (Tenant A) ---');
    const signupA = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        familyName: `Família A ${timestampA}`,
        userName: `Usuário A ${timestampA}`,
        email: `a_${timestampA}@example.com`,
        password: 'password123'
      })
    });
    const dataA = await signupA.json();
    const tokenA = dataA.accessToken;
    const tenantIdA = dataA.tenant.id;
    
    console.log(`✅ Usuário A Criado - Tenant ID: ${tenantIdA}`);
    console.log(`🔑 Token A: ${tokenA.substring(0, 30)}...`);

    const createStudentA = await fetch(`${baseUrl}/students`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        name: `Estudante do Tenant A ${timestampA}`,
        dateOfBirth: '2010-01-01T00:00:00.000Z'
      })
    });
    const studentDataA = await createStudentA.json();
    console.log(`✅ Estudante A Criado: ${studentDataA.name} (ID: ${studentDataA.id})`);

    // --- USUÁRIO B ---
    console.log('\n--- Fluxo Usuário B (Tenant B) ---');
    const signupB = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        familyName: `Família B ${timestampB}`,
        userName: `Usuário B ${timestampB}`,
        email: `b_${timestampB}@example.com`,
        password: 'password123'
      })
    });
    const dataB = await signupB.json();
    const tokenB = dataB.accessToken;
    const tenantIdB = dataB.tenant.id;
    
    console.log(`✅ Usuário B Criado - Tenant ID: ${tenantIdB}`);
    console.log(`🔑 Token B: ${tokenB.substring(0, 30)}...`);

    const listStudentsB = await fetch(`${baseUrl}/students`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${tokenB}`
      }
    });
    const studentsB = await listStudentsB.json();
    console.log(`\n🔍 Listagem de Estudantes para o Usuário B:`, JSON.stringify(studentsB, null, 2));

    // --- VALIDAÇÃO ---
    console.log('\n=========================================');
    console.log(' VEREDICTO DO ISOLAMENTO ');
    console.log('=========================================');
    
    if (studentsB.length === 0) {
      console.log('✅ SUCESSO ABSOLUTO: O Usuário B listou 0 estudantes.');
      console.log('✅ O estudante do Usuário A não vazou para o Tenant B.');
      console.log('✅ Isolamento multi-tenant configurado corretamente!');
    } else {
      console.log('❌ FALHA GRAVE: Vazamento de dados detectado!');
      console.log('❌ O Usuário B conseguiu ver dados que não pertencem ao seu tenant.');
    }
    
  } catch (error) {
    console.error('\n❌ ERRO NO FLUXO:', error.message);
  }
};

testMultitenant();

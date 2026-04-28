const testFlow = async () => {
  const baseUrl = 'http://localhost:3000';
  let token = '';
  const timestamp = Date.now();
  const testEmail = `test_${timestamp}@example.com`;

  console.log('=========================================');
  console.log(' Iniciando Teste de Fluxo Completo (SaaS)');
  console.log('=========================================\n');

  try {
    // 1. Signup
    console.log('--- 1. Testing Signup ---');
    const signupPayload = {
      familyName: `Família Teste ${timestamp}`,
      userName: `Usuário ${timestamp}`,
      email: testEmail,
      password: 'password123'
    };
    console.log('Enviando:', signupPayload);
    
    const signupRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupPayload)
    });
    const signupData = await signupRes.json();
    console.log('Signup Status:', signupRes.status);
    console.log('Signup Response:', JSON.stringify(signupData, null, 2));

    if (!signupRes.ok) throw new Error('Signup falhou');

    // 2. Login
    console.log('\n--- 2. Testing Login ---');
    const loginPayload = {
      email: testEmail,
      password: 'password123'
    };
    console.log('Enviando:', loginPayload);

    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload)
    });
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    console.log('Login Response:', JSON.stringify(loginData, null, 2));

    if (!loginRes.ok) throw new Error('Login falhou');

    token = loginData.accessToken;

    // 3. Create Student
    console.log('\n--- 3. Testing Create Student ---');
    const studentPayload = {
      name: `Estudante Teste ${timestamp}`,
      dateOfBirth: '2015-05-10T00:00:00.000Z'
    };
    console.log('Enviando:', studentPayload);

    const createStudentRes = await fetch(`${baseUrl}/students`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(studentPayload)
    });
    const createStudentData = await createStudentRes.json();
    console.log('Create Student Status:', createStudentRes.status);
    console.log('Create Student Response:', JSON.stringify(createStudentData, null, 2));

    if (!createStudentRes.ok) throw new Error('Criação de estudante falhou');

    // 4. List Students
    console.log('\n--- 4. Testing List Students ---');
    const listStudentsRes = await fetch(`${baseUrl}/students`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    const listStudentsData = await listStudentsRes.json();
    console.log('List Students Status:', listStudentsRes.status);
    console.log('List Students Response:', JSON.stringify(listStudentsData, null, 2));

    if (!listStudentsRes.ok) throw new Error('Listagem de estudantes falhou');

    console.log('\n=========================================');
    console.log('✅ FLUXO COMPLETADO COM SUCESSO!');
    console.log('=========================================');
  } catch (error) {
    console.error('\n❌ ERRO NO FLUXO:', error.message);
  }
};

testFlow();

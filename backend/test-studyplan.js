const testStudyPlanFlow = async () => {
  const baseUrl = 'http://localhost:3000';
  const timestamp = Date.now();
  const testEmail = `sp_${timestamp}@example.com`;
  
  console.log('=========================================');
  console.log(' Iniciando Teste do Módulo StudyPlan');
  console.log('=========================================\n');

  try {
    // 1. Signup / Login
    console.log('--- 1. Criando Usuário e Autenticando ---');
    const signupRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        familyName: `Família SP ${timestamp}`,
        userName: `User SP ${timestamp}`,
        email: testEmail,
        password: 'password123'
      })
    });
    const signupData = await signupRes.json();
    if (!signupRes.ok) throw new Error(`Signup falhou: ${JSON.stringify(signupData)}`);
    const token = signupData.accessToken;
    console.log('✅ Usuário criado e autenticado.');

    const headers = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. Criar Dependências (Student, AcademicYear, Subject)
    console.log('\n--- 2. Criando Dependências (Student, Ano Letivo, Subject) ---');
    const studentRes = await fetch(`${baseUrl}/students`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Aluno SP', dateOfBirth: '2015-01-01T00:00:00Z' })
    });
    const student = await studentRes.json();

    const yearRes = await fetch(`${baseUrl}/academic-years`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Ano 2024', startDate: '2024-01-01T00:00:00Z', endDate: '2024-12-31T00:00:00Z' })
    });
    const year = await yearRes.json();

    const subjectRes = await fetch(`${baseUrl}/subjects`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Matemática SP', color: '#ff0000' })
    });
    const subject = await subjectRes.json();

    console.log(`✅ Student: ${student.id}`);
    console.log(`✅ AcademicYear: ${year.id}`);
    console.log(`✅ Subject: ${subject.id}`);

    // 3. Criar StudyPlan
    console.log('\n--- 3. Criando StudyPlan ---');
    const planRes = await fetch(`${baseUrl}/study-plans`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Plano de Matemática',
        description: 'Foco em Álgebra',
        studentId: student.id,
        academicYearId: year.id
      })
    });
    const plan = await planRes.json();
    if (!planRes.ok) throw new Error(`Criar plano falhou: ${JSON.stringify(plan)}`);
    console.log(`✅ StudyPlan criado: ${plan.id}`);

    // 4. Criar StudyPlanItems
    console.log('\n--- 4. Criando StudyPlanItems ---');
    const item1Res = await fetch(`${baseUrl}/study-plan-items`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        studyPlanId: plan.id,
        subjectId: subject.id,
        title: 'Aula 1: Equações',
        sequenceOrder: 1,
        estimatedMinutes: 60
      })
    });
    const item1 = await item1Res.json();
    
    const item2Res = await fetch(`${baseUrl}/study-plan-items`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        studyPlanId: plan.id,
        subjectId: subject.id,
        title: 'Aula 2: Frações (Para ser deletada)',
        sequenceOrder: 2
      })
    });
    const item2 = await item2Res.json();
    console.log(`✅ Itens criados: [${item1.title}], [${item2.title}]`);

    // Deletar o item 2 para testar soft delete
    console.log('\n--- Testando Soft Delete no Item 2 ---');
    await fetch(`${baseUrl}/study-plan-items/${item2.id}`, { method: 'DELETE', headers });
    console.log(`✅ Item 2 deletado.`);

    // 5. Listar e Detalhar StudyPlan
    console.log('\n--- 5. Detalhando StudyPlan (Verificando includes e soft-delete) ---');
    const getPlanRes = await fetch(`${baseUrl}/study-plans/${plan.id}`, { headers });
    const planDetails = await getPlanRes.json();
    
    console.log(`Nome do Plano: ${planDetails.name}`);
    console.log(`Estudante associado: ${planDetails.student.name}`);
    console.log(`Itens carregados (${planDetails.items.length}):`);
    planDetails.items.forEach((i) => console.log(` - [${i.sequenceOrder}] ${i.title} (Matéria: ${i.subject.name})`));

    if (planDetails.items.length !== 1 || planDetails.items[0].id !== item1.id) {
      throw new Error('Soft delete falhou. O item 2 não deveria aparecer no include.');
    }
    console.log('✅ Soft delete respeitado nos includes!');

    // 6. Validar Activity
    console.log('\n--- 6. Criando Activities ---');
    const actLinkedRes = await fetch(`${baseUrl}/activities`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        studentId: student.id,
        studyPlanItemId: item1.id,
        title: 'Estudo Equações do plano',
        executionDate: new Date().toISOString(),
        status: 'DONE',
        realMinutes: 55
      })
    });
    const actLinked = await actLinkedRes.json();
    console.log(`✅ Activity Vinculada criada: ${actLinked.id}`);

    const actFreeRes = await fetch(`${baseUrl}/activities`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        studentId: student.id,
        title: 'Passeio no Museu (Livre)',
        executionDate: new Date().toISOString(),
        status: 'DONE',
        realMinutes: 120
      })
    });
    const actFree = await actFreeRes.json();
    console.log(`✅ Activity Livre criada: ${actFree.id}`);

    console.log('\n--- Validando Listagem de Atividades ---');
    const listActRes = await fetch(`${baseUrl}/activities?studentId=${student.id}`, { headers });
    const activities = await listActRes.json();
    console.log(`Encontradas ${activities.length} atividades:`);
    activities.forEach(a => {
      console.log(` - ${a.title} | Vinculado: ${a.studyPlanItem ? a.studyPlanItem.title : 'NÃO'}`);
    });

    console.log('\n=========================================');
    console.log('✅ FLUXO STUDY PLAN COMPLETADO COM SUCESSO!');
    console.log('=========================================');
  } catch (error) {
    console.error('\n❌ ERRO NO FLUXO:', error.message);
  }
};

testStudyPlanFlow();

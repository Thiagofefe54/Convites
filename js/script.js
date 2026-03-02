document.addEventListener('DOMContentLoaded', () => {
    // 1. Tema
    const styleMode = document.getElementById('styleMode');
    styleMode.addEventListener('change', (e) => document.documentElement.setAttribute('data-theme', e.target.value));

    // 2. Dinâmica do Local
    const typeSelect = document.getElementById('type');
    const locationLabel = document.getElementById('locationLabel');
    const locationInput = document.getElementById('location');
    const cardType = document.getElementById('cardType');

    typeSelect.addEventListener('change', (e) => {
        const isOnline = e.target.value === 'online';
        locationLabel.textContent = isOnline ? 'Link da Transmissão *' : 'Local do Evento *';
        locationInput.placeholder = isOnline ? 'https://...' : 'Endereço completo';
        cardType.textContent = isOnline ? 'Online' : 'Presencial';
    });

    // 3. Live Preview (Textos base)
    const bindData = (inputId, cardElementId, fallbackText) => {
        const input = document.getElementById(inputId);
        if(!input) return;
        input.addEventListener('input', (e) => document.getElementById(cardElementId).textContent = e.target.value || fallbackText);
    };

    bindData('title', 'cardTitle', 'Título do seu Evento');
    bindData('location', 'cardLocation', 'Defina o local ou link');
    bindData('description', 'cardDesc', 'A descrição do seu evento aparecerá aqui.');
    bindData('email', 'cardEmail', 'email@exemplo.com');
    bindData('phone', 'cardPhone', '(00) 00000-0000');

    // ==========================================
    // 4. A CORREÇÃO DAS DATAS (Blindagem)
    // ==========================================
    const formatDateTime = (dateString) => {
        // Se a string estiver vazia (data incompleta), retorna o padrão
        if (!dateString) return '--/--/---- --:--'; 
        
        const date = new Date(dateString);
        
        // Se a data for inválida ou o ano tiver mais de 4 dígitos (ex: 200900)
        if (isNaN(date.getTime()) || date.getFullYear() > 9999) {
            return '--/--/---- --:--';
        }
        
        // Se passou pela blindagem, formata bonitinho pro padrão BR
        return date.toLocaleString('pt-BR', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    };

    // Escutamos o evento 'input' e 'blur' para garantir que capture a mudança
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    ['input', 'blur'].forEach(evt => {
        startDateInput.addEventListener(evt, (e) => {
            document.getElementById('cardStartDate').textContent = formatDateTime(e.target.value);
        });
        endDateInput.addEventListener(evt, (e) => {
            document.getElementById('cardEndDate').textContent = formatDateTime(e.target.value);
        });
    });

    // 5. Upload de Imagem de Capa Local
    const cardCover = document.getElementById('cardCover');
    document.getElementById('coverImage').addEventListener('change', function() {
        if (this.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => { cardCover.src = e.target.result; cardCover.style.display = 'block'; }
            reader.readAsDataURL(this.files[0]);
        } else { cardCover.style.display = 'none'; }
    });

    // 6. RENDERIZAÇÃO E DOWNLOAD 
    const form = document.getElementById('inviteForm');
    const downloadBtn = document.getElementById('downloadBtn');
    const inviteCard = document.getElementById('inviteCard');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!form.checkValidity()) return form.reportValidity();

        const originalBtnText = downloadBtn.textContent;
        downloadBtn.textContent = 'Gerando Imagem... ⏳';
        downloadBtn.disabled = true;

        try {
            const canvas = await html2canvas(inviteCard, { scale: 2, useCORS: true, backgroundColor: null });
            const imageURL = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            const eventTitle = document.getElementById('title').value || 'evento';
            
            link.download = `convite-${eventTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
            link.href = imageURL;
            
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
        } catch (error) {
            console.error(error); 
            alert("Falha ao gerar a imagem do convite. Tente novamente.");
        } finally {
            downloadBtn.textContent = originalBtnText; 
            downloadBtn.disabled = false;
        }
    });
});
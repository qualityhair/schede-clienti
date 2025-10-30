// === CLIENTE DEL MESE - VERSIONE SEMPLIFICATA ===
class ClienteDelMese {
    constructor() {
        this.clienteDelMese = null;
    }

    async caricaClienteReale() {
        try {
            console.log('🚀 Caricamento cliente del mese...');
            
            const response = await fetch('/api/analisi/clienti-del-mese');
            
            if (response.status === 404) {
                console.log('ℹ️ Nessun dato nel mese scorso');
                return null;
            }
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            this.clienteDelMese = await response.json();
            console.log('✅ Cliente del mese caricato:', this.clienteDelMese.nome);
            return this.clienteDelMese;
            
        } catch (error) {
            console.error('❌ Errore caricamento:', error);
            return null;
        }
    }

    async mostraClienteDelMese() {
        const section = document.getElementById('client-of-month-section');
        if (!section) return;

        const htmlOriginale = section.innerHTML;
        this.mostraLoading(section);

        try {
            const cliente = await this.caricaClienteReale();
            
            if (!cliente) {
                this.mostraNessunDato(section);
                return;
            }

            section.innerHTML = htmlOriginale;
            this.mostraCliente(cliente);

        } catch (error) {
            this.mostraErrore(section);
        }
    }

    mostraCliente(cliente) {
        const visiteMese = parseInt(cliente.visite_mese) || 0;
        const spesaMese = parseFloat(cliente.spesa_mese) || 0;

        const avatar = document.getElementById('client-of-month-avatar');
        const name = document.getElementById('client-of-month-name');
        const since = document.getElementById('client-of-month-since');
        const visits = document.getElementById('stat-visits');
        const spent = document.getElementById('stat-spent');

        // AGGIORNA AVATAR - O FOTO O INIZIALI
        this.aggiornaAvatarCliente(cliente, avatar);
        
        name.textContent = `${cliente.nome} ${cliente.cognome}`;
        since.textContent = cliente.soprannome ? `"${cliente.soprannome}"` : 'Cliente affezionato';
        visits.textContent = visiteMese;
        spent.textContent = `€${Math.round(spesaMese)}`;

        // NASCONDI LA SEZIONE RICONOSCIMENTI
        const achievements = document.querySelector('.client-achievements');
        if (achievements) {
            achievements.style.display = 'none';
        }
    }

    aggiornaAvatarCliente(cliente, avatarElement) {
        // SE C'È LA FOTO: mostra SOLO la foto
        if (cliente.foto_profilo) {
            avatarElement.innerHTML = `
                <img src="${cliente.foto_profilo}" 
                     alt="${cliente.nome} ${cliente.cognome}" 
                     class="client-avatar-photo">
            `;
            avatarElement.classList.add('has-photo');
        } 
        // SE NON C'È LA FOTO: mostra SOLO le iniziali
        else {
            const iniziali = (cliente.nome?.[0] || 'C') + (cliente.cognome?.[0] || '');
            avatarElement.innerHTML = `<div class="client-avatar-initials">${iniziali}</div>`;
            avatarElement.classList.remove('has-photo');
        }
    }

    mostraLoading(section) {
        section.innerHTML = `
            <div class="client-of-month-card" style="text-align: center; padding: 30px;">
                <div class="crown-icon">⏳</div>
                <h3 style="color: #FFD700;">Calcolo in corso...</h3>
            </div>
        `;
    }

    mostraNessunDato(section) {
        section.innerHTML = `
            <div class="client-of-month-card" style="text-align: center; padding: 30px;">
                <div class="crown-icon">📊</div>
                <h3 style="color: #FFD700;">Nessun dato nel mese scorso</h3>
                <p style="color: #cccccc;">Non ci sono trattamenti nel periodo analizzato</p>
            </div>
        `;
    }

    mostraErrore(section) {
        section.innerHTML = `
            <div class="client-of-month-card" style="text-align: center; padding: 30px;">
                <div class="crown-icon">⚠️</div>
                <h3 style="color: #FFD700;">Servizio temporaneamente non disponibile</h3>
            </div>
        `;
    }
}

// INIZIALIZZAZIONE
document.addEventListener('DOMContentLoaded', function() {
    new ClienteDelMese().mostraClienteDelMese();
});
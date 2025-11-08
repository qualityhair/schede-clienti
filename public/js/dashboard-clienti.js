// === CLASSIFICA CLIENTI DEL MESE - VERSIONE CORRETTA ===
class ClienteDelMese {
    constructor() {
        this.classifica = null;
    }

    async caricaClassifica() {
        try {
            console.log('🚀 Caricamento classifica clienti del mese...');
            
            const response = await fetch('/api/analisi/clienti-del-mese');
            
            if (response.status === 404) {
                console.log('ℹ️ Nessun dato questo mese');
                return null;
            }
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            this.classifica = await response.json();
            console.log('✅ Classifica caricata:', this.classifica.length, 'clienti');
            return this.classifica;
            
        } catch (error) {
            console.error('❌ Errore caricamento classifica:', error);
            return null;
        }
    }

    async mostraClassifica() {
        const section = document.getElementById('client-of-month-section');
        if (!section) return;

        // PULISCI completamente la sezione
        section.innerHTML = '';
        this.mostraLoading(section);

        try {
            const classifica = await this.caricaClassifica();
            
            if (!classifica || classifica.length === 0) {
                this.mostraNessunDato(section);
                return;
            }

            // Pulisci e mostra la classifica
            section.innerHTML = '';
            this.mostraClassificaCompleta(classifica, section);

        } catch (error) {
            this.mostraErrore(section);
        }
    }

    mostraClassificaCompleta(classifica, section) {
        const primo = classifica[0];
        const secondo = classifica[1];
        const terzo = classifica[2];

        // Crea il container per la classifica affiancata
        const classificaContainer = document.createElement('div');
        classificaContainer.id = 'classifica-container';
        classificaContainer.className = 'classifica-container';
        
        // Aggiungi titolo
        const titolo = document.createElement('div');
        titolo.className = 'client-of-month-card';
        titolo.innerHTML = `
         
            <h4 class="client-of-month-title">👑 Classifica Del Mese</h4>
        `;
        section.appendChild(titolo);

        // Mostra i tre clienti
        if (primo) {
            const primoElement = this.creaCardClassifica(primo, 'primo-posto', '🥇');
            classificaContainer.appendChild(primoElement);
        }
        
        if (secondo) {
            const secondoElement = this.creaCardClassifica(secondo, 'secondo-posto', '🥈');
            classificaContainer.appendChild(secondoElement);
        }
        
        if (terzo) {
            const terzoElement = this.creaCardClassifica(terzo, 'terzo-posto', '🥉');
            classificaContainer.appendChild(terzoElement);
        }

        section.appendChild(classificaContainer);

        // Nascondi la sezione riconoscimenti se esiste
        const achievements = document.querySelector('.client-achievements');
        if (achievements) {
            achievements.style.display = 'none';
        }
    }

    creaCardClassifica(cliente, classePosizione, emojiPosizione) {
        const visiteMese = parseInt(cliente.visite_mese) || 0;
        const spesaMese = parseFloat(cliente.spesa_mese) || 0;

        const card = document.createElement('div');
        card.className = `classifica-item ${classePosizione}`;
        
        card.innerHTML = `
            <div class="classifica-card">
                <div class="posizione-indicatore">${emojiPosizione}</div>
                <div class="client-avatar-small">
                    ${this.getAvatarHTML(cliente)}
                </div>
                <div class="client-info">
                    <h4>${cliente.nome} ${cliente.cognome}</h4>
                    <p class="client-soprannome">${cliente.soprannome ? `"${cliente.soprannome}"` : 'Cliente fedele'}</p>
                </div>
                <div class="classifica-stats">
                    <div class="classifica-stat">
                        <span class="classifica-stat-value">${visiteMese}</span>
                        <span class="classifica-stat-label">visite</span>
                    </div>
                    <div class="classifica-stat">
                        <span class="classifica-stat-value">€${Math.round(spesaMese)}</span>
                        <span class="classifica-stat-label">spesa</span>
                    </div>
                </div>
            </div>
        `;
        
        return card;
    }

    getAvatarHTML(cliente) {
        if (cliente.foto_profilo) {
            return `<img src="${cliente.foto_profilo}" 
                        alt="${cliente.nome} ${cliente.cognome}" 
                        class="client-avatar-photo">`;
        } else {
            const iniziali = (cliente.nome?.[0] || 'C') + (cliente.cognome?.[0] || '');
            return `<div class="client-avatar-initials-small">${iniziali}</div>`;
        }
    }

    mostraLoading(section) {
        section.innerHTML = `
            <div class="client-of-month-card" style="text-align: center; padding: 30px;">
                <div class="crown-icon">⏳</div>
                <h3 style="color: #FFD700;">Calcolo classifica in corso...</h3>
            </div>
        `;
    }

    mostraNessunDato(section) {
        section.innerHTML = `
            <div class="client-of-month-card" style="text-align: center; padding: 30px;">
                <div class="crown-icon">📊</div>
                <h3 style="color: #FFD700;">Nessun trattamento questo mese</h3>
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
    new ClienteDelMese().mostraClassifica();
});
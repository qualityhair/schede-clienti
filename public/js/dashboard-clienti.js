// === CLIENTE DEL MESE - VERSIONE CON FOTO ===
class ClienteDelMese {
    constructor() {
        this.clienti = [];
    }

    async caricaClientiReali() {
        try {
            console.log('🔍 Caricamento clienti dal database PostgreSQL...');
            
            const response = await fetch('/api/clienti');
            if (!response.ok) {
                throw new Error(`Errore HTTP: ${response.status}`);
            }
            
            this.clienti = await response.json();
            console.log(`✅ Clienti caricati: ${this.clienti.length}`);
            return this.clienti;
            
        } catch (error) {
            console.error('❌ Errore nel caricamento clienti:', error);
            return [];
        }
    }

    async calcolaClienteDelMese() {
        await this.caricaClientiReali();
        
        if (this.clienti.length === 0) {
            console.log('Nessun cliente trovato nel database');
            return null;
        }

        const oggi = new Date();
        const inizioMeseScorso = new Date(oggi.getFullYear(), oggi.getMonth() - 1, 1);
        const fineMeseScorso = new Date(oggi.getFullYear(), oggi.getMonth(), 0);

        console.log('📅 Analisi periodo:', inizioMeseScorso.toDateString(), '-', fineMeseScorso.toDateString());

        let topCliente = null;
        let maxPunteggio = -1;

        for (const cliente of this.clienti) {
            const punteggio = await this.calcolaPunteggioCliente(cliente, inizioMeseScorso, fineMeseScorso);
            
            if (punteggio > maxPunteggio) {
                maxPunteggio = punteggio;
                topCliente = { ...cliente, punteggio };
            }
        }

        console.log('👑 Cliente del mese:', topCliente?.nome, 'Punteggio:', maxPunteggio);
        return topCliente;
    }

    async calcolaPunteggioCliente(cliente, dataInizio, dataFine) {
        let punteggio = 0;

        try {
            // 1. CARICA TRATTAMENTI DEL CLIENTE
            const trattamentiResponse = await fetch(`/api/clienti/${cliente.id}/trattamenti`);
            if (trattamentiResponse.ok) {
                const trattamenti = await trattamentiResponse.json();
                
                const trattamentiMese = trattamenti.filter(t => {
                    if (!t.data_trattamento) return false;
                    const dataTrattamento = new Date(t.data_trattamento);
                    return dataTrattamento >= dataInizio && dataTrattamento <= dataFine;
                });

                punteggio += trattamentiMese.length * 10;

                const spesaMese = trattamentiMese.reduce((tot, t) => {
                    if (t.servizi && Array.isArray(t.servizi)) {
                        return tot + t.servizi.reduce((sum, s) => sum + (parseFloat(s.prezzo) || 0), 0);
                    }
                    return tot + (parseFloat(t.prezzo) || 0);
                }, 0);
                
                punteggio += spesaMese * 0.1;
            }

            // 2. PUNTI PER ACQUISTI PRODOTTI
            if (cliente.storico_acquisti) {
                try {
                    const acquisti = typeof cliente.storico_acquisti === 'string' 
                        ? JSON.parse(cliente.storico_acquisti) 
                        : cliente.storico_acquisti;
                    
                    const acquistiMese = acquisti.filter(a => {
                        if (!a.data) return false;
                        const dataAcquisto = new Date(a.data);
                        return dataAcquisto >= dataInizio && dataAcquisto <= dataFine;
                    });

                    punteggio += acquistiMese.length * 8;
                    
                    const spesaProdotti = acquistiMese.reduce((tot, a) => {
                        return tot + (parseFloat(a.prezzo_unitario) || 0) * (parseInt(a.quantita) || 1);
                    }, 0);
                    
                    punteggio += spesaProdotti * 0.15;
                } catch (e) {
                    console.log(`Errore parsing acquisti cliente ${cliente.id}:`, e);
                }
            }

            // 3. PUNTI PER FEDELTÀ
            if (cliente.created_at) {
                const dataRegistrazione = new Date(cliente.created_at);
                const mesiFedelta = Math.floor((new Date() - dataRegistrazione) / (30 * 24 * 60 * 60 * 1000));
                punteggio += Math.min(mesiFedelta * 2, 20);
            }

        } catch (error) {
            console.error(`Errore nel calcolo punteggio per ${cliente.nome}:`, error);
        }

        return punteggio;
    }

    generaBadges(cliente) {
        const badges = [];
        
        if (cliente.tags && cliente.tags.includes('VIP')) {
            badges.push('👑 VIP');
        }
        
        if (cliente.created_at) {
            const dataReg = new Date(cliente.created_at);
            const anniFedelta = Math.floor((new Date() - dataReg) / (365 * 24 * 60 * 60 * 1000));
            if (anniFedelta >= 2) badges.push('⭐ Storico');
            else if (anniFedelta >= 1) badges.push('👍 Fedele');
        }
        
        if (cliente.ultima_visita) {
            const ultimaVisita = new Date(cliente.ultima_visita);
            const giorniDallUltimaVisita = Math.floor((new Date() - ultimaVisita) / (24 * 60 * 60 * 1000));
            if (giorniDallUltimaVisita < 15) badges.push('⚡ Attivo');
        }

        return badges.length > 0 ? badges : ['💫 Promettente'];
    }

    async mostraClienteDelMese() {
        const clienteDelMese = await this.calcolaClienteDelMese();
        const section = document.getElementById('client-of-month-section');

        if (!clienteDelMese) {
            section.innerHTML = `
                <div class="client-of-month-card" style="text-align: center; padding: 40px;">
                    <div class="crown-icon">📊</div>
                    <h3 style="color: #FFD700;">Nessun dato sufficiente</h3>
                    <p style="color: #cccccc;">Non ci sono abbastanza dati per calcolare il cliente del mese</p>
                </div>
            `;
            return;
        }

        // Calcola statistiche mese scorso
        const oggi = new Date();
        const inizioMeseScorso = new Date(oggi.getFullYear(), oggi.getMonth() - 1, 1);
        const fineMeseScorso = new Date(oggi.getFullYear(), oggi.getMonth(), 0);

        let visiteMese = 0;
        let spesaMese = 0;
        
        try {
            const trattamentiResponse = await fetch(`/api/clienti/${clienteDelMese.id}/trattamenti`);
            if (trattamentiResponse.ok) {
                const trattamenti = await trattamentiResponse.json();
                const trattamentiMese = trattamenti.filter(t => {
                    if (!t.data_trattamento) return false;
                    const dataTrattamento = new Date(t.data_trattamento);
                    return dataTrattamento >= inizioMeseScorso && dataTrattamento <= fineMeseScorso;
                });

                visiteMese = trattamentiMese.length;
                spesaMese = trattamentiMese.reduce((tot, t) => {
                    if (t.servizi && Array.isArray(t.servizi)) {
                        return tot + t.servizi.reduce((sum, s) => sum + (parseFloat(s.prezzo) || 0), 0);
                    }
                    return tot + (parseFloat(t.prezzo) || 0);
                }, 0);
            }
        } catch (error) {
            console.error('Errore nel calcolo statistiche:', error);
        }

        // AGGIORNA UI CON FOTO
        await this.aggiornaAvatarCliente(clienteDelMese);
        
        document.getElementById('client-of-month-name').textContent = 
            `${clienteDelMese.nome || ''} ${clienteDelMese.cognome || ''}`.trim();
        
        // Data registrazione
        let dataRegText = 'Cliente di lunga data';
        if (clienteDelMese.created_at) {
            const dataReg = new Date(clienteDelMese.created_at);
            dataRegText = `Cliente dal: ${dataReg.toLocaleDateString('it-IT')}`;
        }
        document.getElementById('client-of-month-since').textContent = dataRegText;

        // STATISTICHE (SOLO 2)
        document.getElementById('stat-visits').textContent = visiteMese;
        document.getElementById('stat-spent').textContent = `€${Math.round(spesaMese)}`;

        // Badges
        const badges = this.generaBadges(clienteDelMese);
        const badgesContainer = document.getElementById('achievement-badges');
        badgesContainer.innerHTML = badges.map(badge => 
            `<div class="achievement-badge">${badge}</div>`
        ).join('');

        console.log('✅ Cliente del mese aggiornato:', clienteDelMese.nome);
    }

    async aggiornaAvatarCliente(cliente) {
        const avatarContainer = document.getElementById('client-of-month-avatar');
        
        // Se il cliente ha una foto profilo, usala
        if (cliente.foto_profilo_url) {
            avatarContainer.innerHTML = `
                <img src="${cliente.foto_profilo_url}" alt="${cliente.nome} ${cliente.cognome}" class="client-avatar-photo">
            `;
            avatarContainer.classList.add('has-photo');
        } else {
            // Altrimenti mostra le iniziali
            const iniziali = (cliente.nome?.[0] || 'C') + (cliente.cognome?.[0] || '');
            avatarContainer.innerHTML = `<div class="client-avatar-initials">${iniziali}</div>`;
            avatarContainer.classList.remove('has-photo');
        }
    }
}

// === INIZIALIZZAZIONE ===
document.addEventListener('DOMContentLoaded', function() {
    const clienteDelMese = new ClienteDelMese();
    
    setTimeout(() => {
        clienteDelMese.mostraClienteDelMese();
    }, 1000);
});
// Slide deck engine for presentations
function SlideDeck(deckId) {
    this.deck = document.getElementById(deckId);
    if (!this.deck) return;
    this.slides = this.deck.querySelectorAll('.slide');
    if (this.slides.length === 0) return;
    this.currentIndex = 0;
    this.counter = this.deck.querySelector('.slide-counter');
    this.prevBtn = this.deck.querySelector('.slide-btn.prev');
    this.nextBtn = this.deck.querySelector('.slide-btn.next');
    this.init();
}

SlideDeck.prototype.init = function () {
    var self = this;
    this.showSlide(0);

    if (this.prevBtn) {
        this.prevBtn.addEventListener('click', function () {
            self.prev();
        });
    }

    if (this.nextBtn) {
        this.nextBtn.addEventListener('click', function () {
            self.next();
        });
    }

    // Keyboard navigation (skip when user is typing in an input/textarea)
    document.addEventListener('keydown', function (e) {
        var tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            self.next();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            self.prev();
        }
    });
};

SlideDeck.prototype.showSlide = function (idx) {
    this.slides.forEach(function (s) { s.classList.remove('active'); });
    this.slides[idx].classList.add('active');
    this.currentIndex = idx;
    if (this.counter) {
        this.counter.textContent = 'Slide ' + (idx + 1) + ' of ' + this.slides.length;
    }
    if (this.prevBtn) this.prevBtn.disabled = idx === 0;
    if (this.nextBtn) this.nextBtn.disabled = idx === this.slides.length - 1;
};

SlideDeck.prototype.next = function () {
    if (this.currentIndex < this.slides.length - 1) {
        this.showSlide(this.currentIndex + 1);
    }
};

SlideDeck.prototype.prev = function () {
    if (this.currentIndex > 0) {
        this.showSlide(this.currentIndex - 1);
    }
};

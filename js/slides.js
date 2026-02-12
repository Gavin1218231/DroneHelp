// Slide deck engine for presentations
function SlideDeck(deckId) {
    this.deck = document.getElementById(deckId);
    this.slides = this.deck.querySelectorAll('.slide');
    this.currentIndex = 0;
    this.counter = this.deck.querySelector('.slide-counter');
    this.prevBtn = this.deck.querySelector('.slide-btn.prev');
    this.nextBtn = this.deck.querySelector('.slide-btn.next');
    this.init();
}

SlideDeck.prototype.init = function () {
    var self = this;
    this.showSlide(0);

    this.prevBtn.addEventListener('click', function () {
        self.prev();
    });

    this.nextBtn.addEventListener('click', function () {
        self.next();
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
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
    this.counter.textContent = 'Slide ' + (idx + 1) + ' of ' + this.slides.length;
    this.prevBtn.disabled = idx === 0;
    this.nextBtn.disabled = idx === this.slides.length - 1;
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

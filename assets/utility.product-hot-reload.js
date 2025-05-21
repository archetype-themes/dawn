class ProductHotReload extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', (event) => this.onVariantChange(event));
  }

  onVariantChange(event) {
    const optionValueElement = event.target;
    const productFormElement = optionValueElement.closest('form');
    const sectionId = this.dataset.sectionId;

    // Combined listings: We use old and new product urls to determine if the product should change
    const oldProductUrl = this.dataset.productUrl;
    const newProductUrl = optionValueElement.dataset.productUrl;

    // Get the selected option value IDs and format as query param
    const selectedOptionValues = Array.from(productFormElement.querySelectorAll('fieldset input:checked')).map(
      ({ dataset }) => dataset.optionValueId
    );
    const params = selectedOptionValues.length > 0 ? `&option_values=${selectedOptionValues.join(',')}` : '';

    // Deferred variants: Fetch the option value picker with the new availability state when remaining on the same product
    // Combined listings: Fetch the product associated with the selected option value and replace the entire product if switching to a sibling product
    fetch(`${newProductUrl}?section_id=${sectionId}${params}`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');

        // Combined listings: If the product changed, replace the old product section with the new product section
        if (newProductUrl && oldProductUrl !== newProductUrl) {
          this.innerHTML = html.getElementById(this.id).innerHTML;

          // Focus the input for the last clicked option value
          this.querySelector(`#${event.target.id}`).focus();

          return;
        }

        productFormElement.innerHTML = html.querySelector('form').innerHTML;
        this.querySelector(`#${event.target.id}`).focus();

        // Update any other sections that depend on the option value picker
      });
  }
}

customElements.define('product-hot-reload', ProductHotReload);
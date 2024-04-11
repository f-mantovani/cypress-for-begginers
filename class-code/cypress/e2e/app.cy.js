import assert from 'assert';

class RegisterForm {
    elements = {
        titleInput: () => cy.get('#title'),
        titleFeedback: () => cy.get('#titleFeedback'),
        imageUrl: () => cy.get('#imageUrl'),
        urlFeedback: () => cy.get('#urlFeedback'),
        submitBtn: () => cy.get('#btnSubmit'),
    };

    typeTitle(text) {
        if (!text) return;
        this.elements.titleInput().type(text);
    }

    typeUrl(text) {
        if (!text) return;
        this.elements.imageUrl().type(text);
    }

    clickSubmit() {
        this.elements.submitBtn().click();
    }
}

const colors = {
    errors: 'rgb(220, 53, 69)',
	success: ''
};

const registerForm = new RegisterForm();





describe('Image Registration', () => {
	after(() => {
		cy.clearAllLocalStorage()
	})

    describe('Submitting an image with invalid inputs', () => {
        const input = {
            title: '',
            url: '',
        };

        it('Given I am on the image registration page', () => {
            cy.visit('/');
        });

        it(`When I enter "${input.title}" in the title field`, () => {
            registerForm.typeTitle(input.title);
        });

        it(`Then I enter "${input.title}" in the URL field`, () => {
            registerForm.typeUrl(input.url);
        });

        it('Then I click the submit button', () => {
            registerForm.clickSubmit();
        });

        it('Then I should see "Please type a title for the image" message above the title field', () => {
            registerForm.elements
                .titleFeedback()
                .should('contain.text', 'Please type a title for the image');
        });

        it('And I should see "Please type a valid URL" message above the imageUrl field', () => {
            registerForm.elements.urlFeedback().should('contain.text', 'Please type a valid URL');
        });

        it('And I should see an exclamation icon in the title and URL fields', () => {
            registerForm.elements.titleInput().should(([element]) => {
                const styles = getComputedStyle(element);
                const border = styles.getPropertyValue('border-right-color');

                assert.strictEqual(border, colors.errors);
            });
        });
    });
});

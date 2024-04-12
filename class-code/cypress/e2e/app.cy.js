/// <reference types="Cypress" />
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

    hitEnter() {
        cy.focused().type('{enter}');
    }
}

const colors = {
    errors: 'rgb(220, 53, 69)',
    success: 'rgb(25, 135, 84)',
};

const registerForm = new RegisterForm();

describe('Image Registration', () => {
    describe('Submitting an image with invalid inputs', () => {
        after(() => {
            cy.clearAllLocalStorage();
        });

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

    describe('Submitting an image with valid inputs using enter key', () => {
        const input = {
            title: 'Alien BR',
            url: 'https://cdn.mos.cms.futurecdn.net/eM9EvWyDxXcnQTTyH8c8p5-1200-80.jpg',
        };

        it('Given I am on the image registration page', () => {
            cy.visit('/');
        });

        it(`When I enter "${input.title}" in the title field`, () => {
            registerForm.typeTitle(input.title);
            registerForm.hitEnter();
        });

        it('Then I should see a check icon in the title field', () => {
            registerForm.elements.titleInput().should(([element]) => {
                const border = getComputedStyle(element).getPropertyValue('border-right-color');

                assert.strictEqual(border, colors.success);
            });
        });

        it(`When I enter "${input.url}" in the URL field`, () => {
            registerForm.typeUrl(input.url);
        });

        it('Then I should see a check icon in the imageUrl field', () => {
            registerForm.elements.imageUrl().should(([element]) => {
                const border = getComputedStyle(element).getPropertyValue('border-right-color');

                assert.strictEqual(border, colors.success);
            });
        });

        it('Then I can hit enter to submit the form', () => {
            registerForm.hitEnter();
            cy.wait(300);
        });

        it('And the list of registered images should be updated with the new item', () => {
            cy.get('#card-list .card-img').should((elements) => {
                const lastElement = elements[elements.length - 1];
                const lastSrc = lastElement.getAttribute('src');

                assert(lastSrc, input.url);
            });
        });

        it('And the new item should be stored in the localStorage', () => {
            cy.getAllLocalStorage().should((ls) => {
                const currentLocal = ls[location.origin];
                const elements = JSON.parse(Object.values(currentLocal));
                const lastElement = elements.at(-1);

                assert.deepStrictEqual(lastElement, { title: input.title, imageUrl: input.url });
            });
        });

        it('Then The inputs should be cleared', () => {
			registerForm.elements.titleInput().should('have.value', '')
			registerForm.elements.imageUrl().should('have.value', '')
		});
    });
});

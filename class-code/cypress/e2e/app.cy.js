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
            cy.wait(500);
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
            registerForm.elements.titleInput().should('have.value', '');
            registerForm.elements.imageUrl().should('have.value', '');
        });
    });

    describe('Submitting an image and updating the list', () => {
        const input = {
            title: 'Green Alien',
            url: 'https://imgs.search.brave.com/V9RPDkA4Sdr1rOmOtd_jtxTv03eYUSUxLNfbvRP8wno/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTQ4/NDQxOTMzL3Bob3Rv/L3BvcnRyYWl0LW9m/LWFuLWFsaWVuLmpw/Zz9zPTYxMng2MTIm/dz0wJms9MjAmYz1l/V2RpNWZSLVRObWoz/OEJkZTM4SXlJbC0y/UWpKN3B4YXJ2UFRB/dFlla0p3PQ',
        };

        it('Given I am on the image registration page', () => {
            cy.visit('/');
        });

        it(`Then I have entered "${input.title}" in the title field`, () => {
            registerForm.typeTitle(input.title);
        });

        it(`Then I have entered "${input.url}" in the URL field`, () => {
            registerForm.typeUrl(input.url);
        });

        it('When I click the submit button', () => {
            registerForm.clickSubmit();
            cy.wait(500);
        });

        it('And the list of registered images should be updated with the new item', () => {
            cy.get('#card-list .card-img').should((elements) => {
                const last = elements[elements.length - 1];
                const src = last.getAttribute('src');

                assert.strictEqual(src, input.url);
            });
        });

        it('And the new item should be stored in the localStorage', () => {
            cy.getAllLocalStorage().should((ls) => {
                const local = ls[location.origin];
                const elements = JSON.parse(Object.values(local));
                const last = elements.at(-1);

                assert.deepStrictEqual(last, { title: input.title, imageUrl: input.url });
            });
        });

        it('Then The inputs should be cleared', () => {
            registerForm.elements.titleInput().should('have.value', '');
            registerForm.elements.imageUrl().should('have.value', '');
        });
    });

    describe('Refreshing the page after submitting an image clicking in the submit button', () => {
        const input = {
            title: 'Medusa alien',
            url: 'https://imgs.search.brave.com/WQh-JREuOg79zIjtSWTxDnbTygLCnB5r6UcEaNg7fKo/rs:fit:500:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cGhvdG9zLXByZW1p/dW0vZXh0cmF0ZXJy/ZXN0cmUtcXVpLXJl/c3NlbWJsZS1tZWR1/c2UtZWZmZXQtc2Vy/cGVudF8xMDI1MjIy/LTg3Mi5qcGc_c2l6/ZT02MjYmZXh0PWpw/Zw',
        };

        it('Given I am on the image registration page', () => {
            cy.visit('/');
        });

        it('Then I have submitted an image by clicking the submit button', () => {
            registerForm.typeTitle(input.title);
            registerForm.typeUrl(input.url);
            registerForm.clickSubmit();
            cy.wait(500);
        });

        it('When I refresh the page', () => {
            cy.reload();
        });

        it('Then I should still see the submitted image in the list of registered images', () => {
            cy.get('#card-list .card-img').should((elements) => {
                const last = elements[elements.length - 1];
				const src = last.getAttribute('src')

                assert.deepStrictEqual(src, input.url);
            });
        });
    });
});

async function loadCategories() {

    const response =
        await fetch(
            '/api/gifs'
        );

    const categories =
        await response.json();

    const select =
        document.getElementById(
            'category'
        );

    select.innerHTML = '';

    for (
        const category
        of categories
    ) {

        const option =
            document.createElement(
                'option'
            );

        option.value =
            category;

        option.textContent =
            category
                .replace('gifs/', '🎲 ')
                .replace('scenes/', '🎬 ');

        select.appendChild(
            option
        );

    }

}

loadCategories();
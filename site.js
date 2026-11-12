"use strict";

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

if (document.querySelector("main")) {
  const textBlocks = Array.from(
    document.querySelectorAll("main h1, main h2, main h3, main p, main li, main a, main button, main dt, main dd")
  ).filter((element) => {
    if (element.matches("#services-heading")) {
      return false;
    }

    if (element.matches("li") && element.querySelector("h1, h2, h3, p, li, dt, dd")) {
      return false;
    }

    return !element.parentElement?.closest(
      "main h1, main h2, main h3, main p, main li, main a, main button, main dt, main dd"
    );
  });

  const revealWords = (element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.textContent.trim() || node.parentElement.closest("script, style, [aria-hidden='true']")) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const textNodes = [];

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    let wordIndex = 0;
    textNodes.forEach((textNode) => {
      const fragment = document.createDocumentFragment();
      const tokens = textNode.textContent.match(/\s+|[^\s]+/g) || [];

      tokens.forEach((token) => {
        if (/^\s+$/.test(token)) {
          fragment.append(document.createTextNode(token));
          return;
        }

        const word = document.createElement("span");
        word.className = "reveal-word";
        word.style.setProperty("--word-delay", `${Math.min(wordIndex, 28) * 44}ms`);
        word.textContent = token;
        fragment.append(word);
        wordIndex += 1;
      });

      textNode.replaceWith(fragment);
    });

    if (wordIndex > 0) {
      element.classList.add("word-reveal");
    }
  };

  textBlocks.forEach(revealWords);
  document.body.classList.add("has-word-reveal");

  const revealElements = textBlocks.filter((element) => element.classList.contains("word-reveal"));

  const updateRevealVisibility = () => {
    const viewportHeight = window.innerHeight;
    revealElements.forEach((element) => {
      const bounds = element.getBoundingClientRect();
      const visible = bounds.bottom > 24 && bounds.top < viewportHeight - 24;
      element.classList.toggle("word-reveal-visible", visible);
    });
  };

  updateRevealVisibility();
  window.addEventListener("scroll", updateRevealVisibility, { passive: true });
  window.addEventListener("resize", updateRevealVisibility);
}

const portfolioVideos = Array.from(document.querySelectorAll(".portfolio-video video"));

const imageViewer = document.createElement("dialog");
imageViewer.className = "image-viewer";
const imageViewerClose = document.createElement("button");
imageViewerClose.className = "image-viewer-close";
imageViewerClose.type = "button";
imageViewerClose.textContent = "Close";
imageViewerClose.setAttribute("aria-label", "Close full-size image");
const imageViewerImage = document.createElement("img");
imageViewerImage.alt = "";
imageViewer.append(imageViewerClose, imageViewerImage);
document.body.append(imageViewer);

const showPortfolioImage = (source, alt) => {
  imageViewerImage.src = source;
  imageViewerImage.alt = alt;
  imageViewer.showModal();
};

imageViewerClose.addEventListener("click", () => imageViewer.close());
imageViewer.addEventListener("click", (event) => {
  if (event.target === imageViewer) {
    imageViewer.close();
  }
});

document.querySelectorAll("a.portfolio-image-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const image = link.querySelector("img");
    if (image) {
      showPortfolioImage(link.href, image.alt);
    }
  });
});

document.querySelectorAll(".skill-dashboard-card img.project-image").forEach((image) => {
  image.addEventListener("click", (event) => {
    event.preventDefault();
    showPortfolioImage(image.currentSrc || image.src, image.alt);
  });
});

if (portfolioVideos.length > 0) {
  let activeVideo = null;
  const videosWaitingForData = new WeakSet();

  const playVideo = (video) => {
    if (!video || document.hidden || !video.paused) {
      return;
    }

    video.muted = true;
    if (video.readyState < 3) {
      if (!videosWaitingForData.has(video)) {
        videosWaitingForData.add(video);
        video.addEventListener("canplay", () => {
          videosWaitingForData.delete(video);
          if (activeVideo === video) {
            playVideo(video);
          }
        }, { once: true });
      }
      return;
    }

    video.play().then(() => {
      const status = video.closest(".portfolio-video")?.querySelector(".video-status");
      if (status) {
        status.hidden = true;
        status.textContent = "";
      }
    }).catch(() => {
      const status = video.closest(".portfolio-video")?.querySelector(".video-status");
      if (status) {
        status.hidden = false;
        status.textContent = "Autoplay could not start. Press play to watch this video.";
      }
    });
  };

  portfolioVideos.forEach((video) => {
    video.addEventListener("error", () => {
      const status = video.closest(".portfolio-video")?.querySelector(".video-status");
      if (status) {
        status.hidden = false;
        status.textContent = "This video could not load. Refresh the page or try again later.";
      }
    });
  });

  const updateVideoVisibility = () => {
    const visibleVideos = portfolioVideos.map((video) => {
      const bounds = video.getBoundingClientRect();
      const visibleHeight = Math.max(0, Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0));
      const visibleWidth = Math.max(0, Math.min(bounds.right, window.innerWidth) - Math.max(bounds.left, 0));
      const ratio = bounds.width > 0 && bounds.height > 0
        ? (visibleWidth * visibleHeight) / (bounds.width * bounds.height)
        : 0;
      const approaching = bounds.top <= window.innerHeight + 420 && bounds.bottom >= -420;

      if (approaching && video.preload !== "auto") {
        video.preload = "auto";
        if (video.readyState < 3) {
          video.load();
        }
      }

      return { video, ratio };
    }).sort((first, second) => second.ratio - first.ratio);
    const visibleVideo = visibleVideos[0]?.ratio >= 0.15 ? visibleVideos[0].video : null;

    if (activeVideo && activeVideo !== visibleVideo) {
      activeVideo.pause();
    }

    activeVideo = visibleVideo;
    playVideo(activeVideo);
  };

  updateVideoVisibility();
  window.addEventListener("scroll", updateVideoVisibility, { passive: true });
  window.addEventListener("resize", updateVideoVisibility);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      activeVideo?.pause();
    } else {
      updateVideoVisibility();
    }
  });
}

document.querySelectorAll('input[type="date"]').forEach((input) => {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  input.min = localDate;
});

const bookingRequest = document.querySelector("#booking-request");
const bookingContinue = document.querySelector("[data-booking-continue]");

if (bookingRequest && bookingContinue) {
  const revealBookingForm = () => {
    bookingRequest.hidden = false;
    bookingRequest.scrollIntoView({ behavior: motionPreference.matches ? "auto" : "smooth", block: "start" });
  };

  bookingRequest.hidden = true;
  bookingContinue.addEventListener("click", revealBookingForm);

  window.addEventListener("message", (event) => {
    if (
      event.origin === "https://calendly.com" &&
      event.data?.event === "calendly.event_scheduled"
    ) {
      revealBookingForm();
    }
  });
}

document.querySelectorAll("form[data-mail-draft]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = form.querySelector("[data-form-status]");
    const recipient = form.dataset.mailDraft;
    const values = new FormData(form);

    if (values.get("website")) {
      status.textContent = "The form could not be prepared. Please use the visible fields or email me directly.";
      return;
    }

    const subject = String(values.get("email_subject") || "Website enquiry");
    const body = Array.from(values.entries())
      .filter(([name]) => name !== "website" && name !== "email_subject")
      .map(([name, value]) => `${name.replaceAll("_", " ")}: ${String(value).trim() || "Not provided"}`)
      .join("\n");
    const draft = document.createElement("a");
    draft.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    draft.textContent = "Open the email draft";
    status.replaceChildren(
      document.createTextNode("Your enquiry has not been sent or stored. Review it in your email app and press Send. "),
      draft,
      document.createTextNode(`. If no email app opens, email ${recipient} directly.`)
    );
    status.focus?.();
  });
});
